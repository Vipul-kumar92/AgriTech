"""
Authentication REST Endpoints
AI-Based Crop Yield Prediction System
"""

import os
import re
import json
import base64
import logging
from datetime import datetime, timezone
import httpx
from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from backend.app.config import settings
from backend.app.schemas.auth import UserRegister, UserLogin, GoogleAuthRequest, UserProfileUpdate, UserResponse, Token, GoogleClientIdUpdate
from backend.app.auth.security import hash_password, verify_password
from backend.app.auth.jwt_handler import create_access_token, get_current_user, get_current_admin
from backend.app.database import get_database

logger = logging.getLogger(__name__)
GOOGLE_CLIENT_ID_PATTERN = re.compile(r"^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$")

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister):
    """Register a new farmer or user account and persist to MongoDB."""
    db = get_database()
    email_clean = user_in.email.lower().strip()
    existing_user = await db.users.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Standardize role: strictly FARMER for this agricultural application
    role = "FARMER"

    user_doc = {
        "name": user_in.name.strip(),
        "email": email_clean,
        "password_hash": hash_password(user_in.password),
        "role": role,
        "auth_provider": "local",
        "phone": user_in.phone.strip() if user_in.phone else None,
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Issue signed JWT token
    access_token = create_access_token(data={"sub": user_doc["email"], "role": user_doc["role"], "name": user_doc["name"]})
    
    user_response = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"],
        auth_provider=user_doc["auth_provider"],
        phone=user_doc.get("phone")
    )
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticate registered user or farmer with email and password."""
    db = get_database()
    email_clean = credentials.email.lower().strip()
    user = await db.users.find_one({"email": email_clean})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Handle users who registered solely with Google OAuth
    if not user.get("password_hash") and user.get("auth_provider") == "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account was registered with Google. Please click 'Continue with Google'."
        )

    if not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_role = user.get("role", "FARMER")
    access_token = create_access_token(data={"sub": user["email"], "role": user_role, "name": user.get("name", "")})
    
    user_response = UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user_role,
        created_at=user.get("created_at", datetime.now(timezone.utc)),
        auth_provider=user.get("auth_provider", "local"),
        picture=user.get("picture"),
        phone=user.get("phone")
    )
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/google", response_model=Token)
async def google_auth(payload: GoogleAuthRequest):
    """
    Authenticate or register a farmer/user account via Google OAuth 2.0.
    In production (or when ALLOW_DEV_OAUTH_BYPASS is false), requires a verified Google ID token.
    """
    db = get_database()

    email = payload.email
    name = payload.name
    picture = payload.picture

    if payload.token:
        google_info = None
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={payload.token}")
                if resp.status_code == 200:
                    candidate = resp.json()
                    email_verified = str(candidate.get("email_verified", "")).lower() == "true"
                    aud_matches = not settings.GOOGLE_CLIENT_ID or candidate.get("aud") == settings.GOOGLE_CLIENT_ID
                    if email_verified and aud_matches:
                        google_info = candidate
                    else:
                        logger.warning("Google tokeninfo rejected: unverified email or client_id mismatch")
        except Exception as e:
            logger.warning(f"Google tokeninfo verification failed: {e}")

        # Only allow unverified JWT payload decoding in local dev bypass mode
        if not google_info:
            if not settings.ALLOW_DEV_OAUTH_BYPASS:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or unverified Google ID token"
                )
            if "." in payload.token:
                try:
                    parts = payload.token.split(".")
                    if len(parts) >= 2:
                        padded = parts[1] + "=" * ((4 - len(parts[1]) % 4) % 4)
                        decoded = base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8")
                        google_info = json.loads(decoded)
                except Exception as e:
                    logger.warning(f"Could not parse payload from token: {e}")

        if google_info:
            email = google_info.get("email", email)
            name = google_info.get("name") or google_info.get("given_name") or name
            picture = google_info.get("picture", picture)
    elif not settings.ALLOW_DEV_OAUTH_BYPASS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verified Google ID token is required"
        )

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid Google account email or authentication token is required"
        )
        
    email_clean = str(email).lower().strip()
    
    # Derive name if missing
    if not name or not name.strip():
        username_part = email_clean.split("@")[0]
        name = " ".join(word.capitalize() for word in username_part.replace(".", " ").replace("_", " ").split())
    else:
        name = name.strip()
        
    if not picture:
        picture = f"https://api.dicebear.com/7.x/initials/svg?seed={email_clean}&backgroundColor=16a34a"

    user = await db.users.find_one({"email": email_clean})

    if user:
        # Existing user - ensure provider is google and picture is stored
        update_fields = {"auth_provider": "google"}
        if picture and not user.get("picture"):
            update_fields["picture"] = picture
        if name and not user.get("name"):
            update_fields["name"] = name
            
        await db.users.update_one({"_id": user["_id"]}, {"$set": update_fields})
        user.update(update_fields)

        user_id = str(user["_id"])
        user_role = user.get("role", "FARMER")
        user_name = user.get("name", name)
        created_at = user.get("created_at", datetime.now(timezone.utc))
        picture = user.get("picture", picture)
    else:
        # New Farmer Registration through Google - persist to MongoDB
        role = "FARMER"

        user_doc = {
            "name": name,
            "email": email_clean,
            "password_hash": None,
            "role": role,
            "auth_provider": "google",
            "picture": picture,
            "created_at": datetime.now(timezone.utc)
        }
        res = await db.users.insert_one(user_doc)
        user_id = str(res.inserted_id)
        user_role = user_doc["role"]
        user_name = user_doc["name"]
        created_at = user_doc["created_at"]

    access_token = create_access_token(data={"sub": email_clean, "role": user_role, "name": user_name})
    
    user_response = UserResponse(
        id=user_id,
        name=user_name,
        email=email_clean,
        role=user_role,
        created_at=created_at,
        auth_provider="google",
        picture=picture
    )
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve profile of authenticated user."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "FARMER"),
        created_at=current_user.get("created_at", datetime.now(timezone.utc)),
        auth_provider=current_user.get("auth_provider", "local"),
        picture=current_user.get("picture"),
        phone=current_user.get("phone")
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    payload: UserProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update profile details (name, phone, role, picture, password) for authenticated user."""
    db = get_database()
    update_fields = {}
    
    if payload.name is not None and payload.name.strip():
        update_fields["name"] = payload.name.strip()
        
    if payload.phone is not None:
        update_fields["phone"] = payload.phone.strip() if payload.phone.strip() else None
        
    if payload.picture is not None and payload.picture.strip():
        update_fields["picture"] = payload.picture.strip()
        
    if payload.role is not None:
        update_fields["role"] = "FARMER"
            
    # Handle password change if requested
    if payload.new_password:
        user_record = await db.users.find_one({"_id": ObjectId(current_user["id"])})
        if user_record and user_record.get("password_hash"):
            if not payload.current_password or not verify_password(payload.current_password, user_record["password_hash"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Current password is incorrect"
                )
        update_fields["password_hash"] = hash_password(payload.new_password)

    if update_fields:
        update_fields["updated_at"] = datetime.now(timezone.utc)
        await db.users.update_one(
            {"_id": ObjectId(current_user["id"])},
            {"$set": update_fields}
        )
        
    updated_user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    return UserResponse(
        id=str(updated_user["_id"]),
        name=updated_user.get("name", current_user["name"]),
        email=updated_user["email"],
        role=updated_user.get("role", "FARMER"),
        created_at=updated_user.get("created_at", datetime.now(timezone.utc)),
        auth_provider=updated_user.get("auth_provider", "local"),
        picture=updated_user.get("picture"),
        phone=updated_user.get("phone")
    )

@router.post("/google-client-id")
async def save_google_client_id(
    payload: GoogleClientIdUpdate,
    admin_user: dict = Depends(get_current_admin)
):
    """
    Save Google OAuth 2.0 Client ID to frontend/.env configuration file (Admin only, non-production).
    """
    if settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Modifying .env configuration via API is disabled in production"
        )

    client_id = payload.client_id.strip()
    if any(ch in client_id for ch in ("\n", "\r", "\x00")) or not GOOGLE_CLIENT_ID_PATTERN.match(client_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google OAuth Client ID format"
        )

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    env_path = os.path.join(root_dir, "frontend", ".env")
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        updated = False
        new_lines = []
        for line in lines:
            if line.startswith("VITE_GOOGLE_CLIENT_ID="):
                new_lines.append(f'VITE_GOOGLE_CLIENT_ID="{client_id}"\n')
                updated = True
            else:
                new_lines.append(line)
        if not updated:
            new_lines.append(f'VITE_GOOGLE_CLIENT_ID="{client_id}"\n')
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        logger.warning(f"Could not persist client_id to frontend/.env: {e}")
        
    return {"status": "success", "client_id": client_id}

