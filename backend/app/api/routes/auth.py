import os

import jwt as pyjwt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

from app.core.emails import send_password_reset_email
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    generate_reset_token,
    get_current_user,
    hash_refresh_token,
    hash_reset_token,
    is_refresh_token_valid,
    is_reset_token_valid,
    refresh_token_expiry,
    reset_token_expiry,
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


class GoogleLoginRequest(BaseModel):
    credential: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# =========================
# Google Sign-In helpers
# =========================

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"

_jwks_client: pyjwt.PyJWKClient | None = None


def _get_google_jwks_client() -> pyjwt.PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        _jwks_client = pyjwt.PyJWKClient(
            GOOGLE_JWKS_URL,
            cache_keys=True,
            headers={"User-Agent": "CivicLens-AI/1.0"},
        )
    return _jwks_client


def _verify_google_credential(credential: str) -> dict:
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=503,
            detail="Google Sign-In is not configured on the server yet.",
        )

    try:
        signing_key = _get_google_jwks_client().get_signing_key_from_jwt(credential)

        payload = pyjwt.decode(
            credential,
            signing_key.key,
            algorithms=["RS256"],
            audience=GOOGLE_CLIENT_ID,
            options={"verify_iss": False},
        )
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential. Please try again.",
        )

    if payload.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential issuer.",
        )

    if not payload.get("email"):
        raise HTTPException(
            status_code=400,
            detail="Your Google account has no email address associated with it.",
        )

    return payload


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
# GOOGLE SIGN-IN
# =========================

@router.post("/google")
def google_login(request: GoogleLoginRequest):

    claims = _verify_google_credential(request.credential)

    email = claims["email"]
    name = claims.get("name") or "Google User"
    google_sub = claims.get("sub")

    user = users_collection.find_one({"email": email})

    if user is None:
        # Auto-create the account from the Google profile.
        users_collection.insert_one({
            "fullName": name,
            "email": email,
            "password": None,
            "provider": "google",
            "googleSub": google_sub,
            "age": None,
            "educationLevel": None,
            "interests": [],
        })

        user = users_collection.find_one({"email": email})
    else:
        # Link the Google identity to the existing account.
        users_collection.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "provider": user.get("provider") or "google",
                    "googleSub": user.get("googleSub") or google_sub,
                }
            },
        )

    refresh_token = _issue_refresh_token(user["_id"])

    return {
        "message": "Logged in with Google.",
        "access_token": create_access_token(str(user["_id"])),
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "fullName": user["fullName"],
            "email": user["email"],
            "age": user.get("age"),
            "educationLevel": user.get("educationLevel"),
            "interests": user.get("interests", []),
        },
    }


# =========================
# FORGOT PASSWORD
# =========================

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest):

    generic_message = (
        "If an account exists with that email, a reset link has been sent."
    )

    user = users_collection.find_one({"email": request.email})

    if not user:
        # Do not reveal whether the email exists.
        return {"message": generic_message}

    reset_token = generate_reset_token()

    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "resetTokenHash": hash_reset_token(reset_token),
                "resetTokenExpiresAt": reset_token_expiry(),
            }
        },
    )

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:4200").rstrip("/")
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"

    sent = send_password_reset_email(user["email"], reset_url)

    if not sent:
        # Dev fallback: expose the reset link (no SMTP configured) so the
        # flow remains fully testable in local development.
        print("🔗 (dev) Password reset link:", reset_url)
        return {
            "message": generic_message,
            "dev_reset_link": reset_url,
        }

    return {"message": generic_message}


# =========================
# RESET PASSWORD
# =========================

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):

    user = users_collection.find_one({
        "resetTokenHash": hash_reset_token(request.token)
    })

    if not user or not is_reset_token_valid(user, request.token):
        raise HTTPException(
            status_code=400,
            detail="This reset link is invalid or has expired. Please request a new one.",
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters.",
        )

    new_password_hash = password_hash.hash(request.new_password)

    # Update password, invalidate the reset link, and revoke any active sessions.
    users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "password": new_password_hash,
                "resetTokenHash": None,
                "resetTokenExpiresAt": None,
                "refreshTokenHash": None,
                "refreshTokenExpiresAt": None,
            }
        },
    )

    return {
        "message": "Password updated successfully. You can now sign in."
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