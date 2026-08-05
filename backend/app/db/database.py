from pymongo import MongoClient

MONGO_URL = "mongodb+srv://mrahul2572002:Zzj5kw3KRxGnZNyu@cluster0.2hrsxa6.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URL)

db = client["civiclens"]

topics_collection = db["topics"]

try:
    client.admin.command("ping")
    print("✅ MongoDB connection successful!")
except Exception as e:
    print("❌ MongoDB connection failed:", e)