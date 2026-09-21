"""
Authentication REST Endpoints
AI-Based Crop Yield Prediction System
"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from backend.app.auth.security import hash_password, verify_password
from backend.app.auth.jwt_handler import create_access_token, get_current_user
from backend.app.database import get_database

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister):
    """Register a new user account."""
    db = get_database()
    existing_user = await db.users.find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    user_doc = {
        "name": user_in.name.strip(),
        "email": user_in.email.lower().strip(),
        "password_hash": hash_password(user_in.password),
        "role": "USER",
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Issue JWT token
    access_token = create_access_token(data={"sub": user_doc["email"], "role": user_doc["role"], "name": user_doc["name"]})
    
    user_response = UserResponse(
        id=user_id,
        name=user_doc["name"],
        email=user_doc["email"],
        role=user_doc["role"],
        created_at=user_doc["created_at"]
    )
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Authenticate with email and password."""
    db = get_database()
    user = await db.users.find_one({"email": credentials.email.lower().strip()})
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email address or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"], "role": user.get("role", "USER"), "name": user.get("name", "")})
    
    user_response = UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user.get("role", "USER"),
        created_at=user.get("created_at", datetime.now(timezone.utc))
    )
    return Token(access_token=access_token, token_type="bearer", user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Retrieve profile of authenticated user."""
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        role=current_user.get("role", "USER"),
        created_at=current_user.get("created_at", datetime.now(timezone.utc))
    )
