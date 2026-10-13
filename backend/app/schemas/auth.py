"""
Authentication Pydantic Schemas
AI-Based Crop Yield Prediction System
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name")
    email: EmailStr = Field(..., description="Valid Email Address")
    password: str = Field(..., min_length=6, max_length=100, description="Secure Password")
    role: Optional[str] = Field("FARMER", description="User role, e.g. FARMER or USER")
    phone: Optional[str] = Field(None, description="Optional phone number")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    email: Optional[EmailStr] = Field(None, description="Google Account Email")
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Google Account Display Name")
    picture: Optional[str] = Field(None, description="Google Profile Picture URL")
    role: Optional[str] = Field("FARMER", description="User role: FARMER, USER, etc.")
    token: Optional[str] = Field(None, description="Google OAuth ID Token or Credential")

class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Updated Full Name")
    phone: Optional[str] = Field(None, max_length=20, description="Updated Phone Number")
    picture: Optional[str] = Field(None, description="Updated Avatar URL")
    role: Optional[str] = Field(None, description="Updated User Role: FARMER or USER")
    current_password: Optional[str] = Field(None, description="Current password for verification")
    new_password: Optional[str] = Field(None, min_length=6, max_length=100, description="New password")

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    role: str
    created_at: datetime
    auth_provider: Optional[str] = "local"
    picture: Optional[str] = None
    phone: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
