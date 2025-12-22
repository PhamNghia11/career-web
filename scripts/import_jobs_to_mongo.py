"""
Import Jobs Data to MongoDB
This script imports jobs from data/jobs.json to MongoDB

Requirements:
- pip install pymongo

Usage:
- Make sure MongoDB is running on localhost:27017
- Run: python scripts/import_jobs_to_mongo.py
"""

import json
import os
from datetime import datetime

try:
    from pymongo import MongoClient
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    print("❌ pymongo not installed. Run: pip install pymongo")
    exit(1)


def import_jobs():
    # MongoDB connection
    MONGO_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = "gdu_career"
    COLLECTION_NAME = "jobs"
    
    print("=" * 50)
    print("📥 GDU Career - Import Jobs to MongoDB")
    print("=" * 50)
    
    # Read jobs from JSON file
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs.json")
    
    if not os.path.exists(json_path):
        print(f"❌ File not found: {json_path}")
        return
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Support both array format and object format
    if isinstance(data, list):
        jobs = data
    else:
        jobs = data.get("jobs", [])
    
    print(f"📄 Found {len(jobs)} jobs in JSON file")
    
    # Connect to MongoDB
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        print(f"✅ Connected to MongoDB: {MONGO_URI}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return
    
    # Clear existing jobs (optional)
    existing_count = collection.count_documents({})
    if existing_count > 0:
        print(f"⚠️  Found {existing_count} existing jobs in collection")
        response = input("Do you want to replace them? (y/n): ").strip().lower()
        if response == "y":
            collection.delete_many({})
            print("🗑️  Cleared existing jobs")
        else:
            print("ℹ️  Keeping existing jobs, adding new ones")
    
    # Transform jobs for MongoDB
    for job in jobs:
        # Convert _id if exists, or use id
        if "_id" in job:
            job["_id"] = job["_id"]
        elif "id" in job:
            job["_id"] = job.pop("id")
        
        # Add import timestamp
        job["importedAt"] = datetime.now().isoformat()
    
    # Insert jobs
    try:
        result = collection.insert_many(jobs)
        print(f"✅ Successfully imported {len(result.inserted_ids)} jobs")
    except Exception as e:
        print(f"❌ Failed to insert jobs: {e}")
        return
    
    # Show summary
    print("\n" + "=" * 50)
    print("📊 Import Summary")
    print("=" * 50)
    print(f"Database: {DB_NAME}")
    print(f"Collection: {COLLECTION_NAME}")
    print(f"Total jobs: {collection.count_documents({})}")
    
    # Show job types distribution
    pipeline = [
        {"$group": {"_id": "$type", "count": {"$sum": 1}}}
    ]
    type_counts = list(collection.aggregate(pipeline))
    print("\nJobs by type:")
    for item in type_counts:
        print(f"  - {item['_id']}: {item['count']}")
    
    # Show fields distribution
    pipeline = [
        {"$group": {"_id": "$field", "count": {"$sum": 1}}}
    ]
    field_counts = list(collection.aggregate(pipeline))
    print("\nJobs by field:")
    for item in field_counts:
        print(f"  - {item['_id']}: {item['count']}")
    
    print("\n✅ Import completed successfully!")
    client.close()


if __name__ == "__main__":
    import_jobs()
