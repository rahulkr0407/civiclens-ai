from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

from app.core.security import (
    create_access_token,
    generate_refresh_token,
    get_current_user,
    hash_refresh_token,
    is_refresh_token_valid,
    refresh_token_expiry,
)
from app.db.database import users_collection


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


password_hash = PasswordHash.recommended()


# =========================
# Request Models
# =========================

class SignupRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    age: int
    educationLevel: str
    interests: list[str]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


def _issue_refresh_token(user_id: str) -> str:
    """Generate a refresh token, persist its hash, and return the plain value."""
    refresh_token = generate_refresh_token()

    users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "refreshTokenHash": hash_refresh_token(refresh_token),
                "refreshTokenExpiresAt": refresh_token_expiry(),
            }
        },
    )

    return refresh_token


# =========================
# SIGNUP
# =========================

@router.post("/signup")
def signup(user: SignupRequest):

    # Check if email already exists
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    # Hash password
    hashed_password = password_hash.hash(user.password)

    # Save user
    users_collection.insert_one({
        "fullName": user.fullName,
        "email": user.email,
        "password": hashed_password,

        # Learning profile
        "age": user.age,
        "educationLevel": user.educationLevel,
        "interests": user.interests,
    })

    return {
        "message": "Account created successfully."
    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(user: LoginRequest):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    password_valid = password_hash.verify(
        user.password,
        existing_user["password"]
    )

    if not password_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    refresh_token = _issue_refresh_token(existing_user["_id"])

    return {
        "message": "Login successful.",
        "access_token": create_access_token(str(existing_user["_id"])),
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "fullName": existing_user["fullName"],
            "email": existing_user["email"],
            "age": existing_user.get("age"),
            "educationLevel": existing_user.get("educationLevel"),
            "interests": existing_user.get("interests", []),
        },
    }


# =========================
# REFRESH
# =========================

@router.post("/refresh")
def refresh(request: RefreshRequest):

    if not request.refresh_token:
        raise HTTPException(
            status_code=401,
            detail="No refresh token provided.",
        )

    user = users_collection.find_one({
        "refreshTokenHash": hash_refresh_token(request.refresh_token)
    })

    if not user or not is_refresh_token_valid(user, request.refresh_token):
        raise HTTPException(
            status_code=401,
            detail="Your session has expired. Please log in again.",
        )

    # Rotate: revoke the old token and issue a fresh one.
    new_refresh_token = _issue_refresh_token(user["_id"])

    return {
        "access_token": create_access_token(str(user["_id"])),
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


# =========================
# LOGOUT
# =========================

@router.post("/logout")
def logout(request: RefreshRequest):

    users_collection.update_one(
        {"refreshTokenHash": hash_refresh_token(request.refresh_token)},
        {
            "$set": {
                "refreshTokenHash": None,
                "refreshTokenExpiresAt": None,
            }
        },
    )

    return {
        "message": "Logged out successfully."
    }


# =========================
# CURRENT USER
# =========================

@router.get("/me")
def current_user(user: dict = Depends(get_current_user)):
    return {
        "fullName": user["fullName"],
        "email": user["email"],
        "age": user.get("age"),
        "educationLevel": user.get("educationLevel"),
        "interests": user.get("interests", []),
    }