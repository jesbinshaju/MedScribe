
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# This loads the link from your .env file
load_dotenv()
uri = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(uri)
db = client.medscribe

async def save_record(data):
    await db.records.insert_one(data)

async def get_all_records():
    records = []
    cursor = db.records.find().sort("created_at", -1)
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        records.append(doc)
    return records
