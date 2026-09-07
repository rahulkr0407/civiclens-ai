import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db.database import users_collection

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "60"))
REFRESH_TOKEN_DAYS = int(os.getenv("REFRESH_TOKEN_DAYS", "30"))

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is not configured. Set it in the environment "
        "(local `.env` or Render service variable) before using auth."
    )

_bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=JWT_EXPIRES_MINUTES)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": expires,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token. Please log in again.",
        )
    return payload["sub"]


# =========================
# Refresh tokens
# =========================

def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def refresh_token_expiry() -> datetime:
    return _utc_now() + timedelta(days=REFRESH_TOKEN_DAYS)


# =========================
# Password-reset tokens
# =========================

RESET_TOKEN_HOURS = int(os.getenv("RESET_TOKEN_HOURS", "1"))


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def reset_token_expiry() -> datetime:
    return _utc_now() + timedelta(hours=RESET_TOKEN_HOURS)


def is_reset_token_valid(user: dict, token: str) -> bool:
    stored = user.get("resetTokenHash")
    expires_at = user.get("resetTokenExpiresAt")

    if not stored or not token:
        return False

    if not secrets.compare_digest(hash_reset_token(token), stored):
        return False

    if not expires_at or _as_utc(expires_at) < _utc_now():
        return False

    return True


def is_refresh_token_valid(user: dict, token: str) -> bool:
    stored = user.get("refreshTokenHash")
    expires_at = user.get("refreshTokenExpiresAt")

    if not stored or not token:
        return False

    if not secrets.compare_digest(hash_refresh_token(token), stored):
        return False

    if not expires_at or _as_utc(expires_at) < _utc_now():
        return False

    return True


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> dict:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Not authenticated. Please log in.",
        )

    user_id = decode_token(credentials.credentials)

    try:
        user_oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid token. Please log in again.",
        )

    user = users_collection.find_one(
        {"_id": user_oid},
        {"password": 0},
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Account no longer exists. Please log in again.",
        )

    return user