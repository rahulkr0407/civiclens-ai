from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

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

    return {
        "message": "Login successful.",
        "user": {
            "fullName": existing_user["fullName"],
            "email": existing_user["email"],
            "age": existing_user.get("age"),
            "educationLevel": existing_user.get("educationLevel"),
            "interests": existing_user.get("interests", []),
        },
    }