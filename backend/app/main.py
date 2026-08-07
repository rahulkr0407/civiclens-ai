from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import topics, ai, auth

app = FastAPI(
    title="CivicLens AI API",
    description="Backend API for CivicLens AI",
    version="1.0.0",
)

# Allow Angular frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "https://civiclens-ai-2d87.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(topics.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(auth.router, prefix="/api")