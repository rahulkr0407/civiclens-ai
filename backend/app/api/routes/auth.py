from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

from app.db.database import users_collection

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

password_hash = PasswordHash.recommended()


class SignupRequest(BaseModel):
    fullName: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# @router.post("/signup")
# def signup(user: SignupRequest):

#     existing_user = users_collection.find_one({
#         "email": user.email
#     })

#     if existing_user:
#         raise HTTPException(
#             status_code=400,
#             detail="An account with this email already exists.",
#         )

#     hashed_password = password_hash.hash(user.password)

#     users_collection.insert_one({
#         "fullName": user.fullName,
#         "email": user.email,
#         "password": hashed_password,
#     })

#     return {
#         "message": "Account created successfully."
#     }

@router.post("/signup")
def signup(user: SignupRequest):

    print("SIGNUP DATA:", user)

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists.",
        )

    hashed_password = password_hash.hash(user.password)

    result = users_collection.insert_one({
        "fullName": user.fullName,
        "email": user.email,
        "password": hashed_password,
    })

    print("INSERTED ID:", result.inserted_id)

    saved_user = users_collection.find_one({
        "_id": result.inserted_id
    })

    print("SAVED USER:", saved_user)

    return {
        "message": "Signup successful",
        "user_id": str(result.inserted_id)
    }


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
        },
    }