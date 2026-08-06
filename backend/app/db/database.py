import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL is not configured")

client = MongoClient(MONGO_URL)

db = client["civiclens"]

topics_collection = db["topics"]
users_collection = db["users"]

try:
    client.admin.command("ping")
    print("✅ MongoDB connection successful!")
except Exception as e:
    print("❌ MongoDB connection failed:", e)