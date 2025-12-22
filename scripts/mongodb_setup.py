"""
MongoDB Setup Script for GDU Career Portal
This script sets up the MongoDB database and collections

To run locally:
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB: mongod --dbpath /path/to/data
3. Install pymongo: pip install pymongo
4. Run this script: python scripts/mongodb_setup.py
"""

import json
from datetime import datetime, timedelta
import random

# Note: In v0 environment, pymongo may not be available
# This script is meant to be run locally with MongoDB installed

try:
    from pymongo import MongoClient
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False
    print("pymongo not available - generating sample data only")


def generate_sample_users(count=50):
    """Generate sample user data"""
    roles = ["student", "employer", "admin"]
    majors = [
        "Cong nghe thong tin",
        "Quan tri kinh doanh", 
        "Marketing",
        "Tai chinh ngan hang",
        "Ke toan",
        "Ngon ngu Anh"
    ]
    
    users = []
    for i in range(count):
        role = random.choices(roles, weights=[80, 18, 2])[0]
        user = {
            "email": f"user{i+1}@{'gdu.edu.vn' if role == 'student' else 'company.com'}",
            "name": f"User {i+1}",
            "role": role,
            "status": "active",
            "createdAt": datetime.now() - timedelta(days=random.randint(0, 365)),
        }
        
        if role == "student":
            user["studentId"] = f"GDU2024{str(i+1).zfill(3)}"
            user["major"] = random.choice(majors)
        
        users.append(user)
    
    return users


def generate_sample_jobs(count=30):
    """Generate sample job data"""
    companies = ["Techcombank", "FPT Software", "ITP - DHQG-HCM", "IPS Independent", "TekNix Corporation", "Cohota"]
    locations = ["Ha Noi", "TP. Thu Duc, TP.HCM", "Binh Chanh, TP.HCM", "Quan Binh Thanh, TP.HCM"]
    types = ["full-time", "part-time", "internship"]
    
    titles = [
        "Frontend Developer", "Backend Developer", "Full Stack Developer",
        "Marketing Executive", "Business Analyst", "Data Analyst",
        "Graphic Designer", "Content Writer", "HR Intern",
        "Finance Analyst", "Product Manager", "UI/UX Designer"
    ]
    
    jobs = []
    for i in range(count):
        job = {
            "title": random.choice(titles),
            "company": random.choice(companies),
            "location": random.choice(locations),
            "type": random.choice(types),
            "salary": f"{random.randint(5, 20)}-{random.randint(20, 40)} trieu",
            "description": "Mo ta cong viec chi tiet...",
            "requirements": ["Yeu cau 1", "Yeu cau 2", "Yeu cau 3"],
            "benefits": ["Quyen loi 1", "Quyen loi 2"],
            "deadline": datetime.now() + timedelta(days=random.randint(7, 60)),
            "createdAt": datetime.now() - timedelta(days=random.randint(0, 30)),
            "status": "active",
            "applicants": random.randint(0, 100)
        }
        jobs.append(job)
    
    return jobs


def generate_sample_reviews(count=100):
    """Generate sample Google reviews data"""
    authors = [
        "Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D",
        "Hoang Van E", "Vo Thi F", "Dang Van G", "Bui Thi H"
    ]
    
    positive_reviews = [
        "Truong dai hoc rat tot, giang vien nhiet tinh.",
        "Co so vat chat hien dai, moi truong than thien.",
        "Chuong trinh dao tao phu hop voi thuc tien.",
        "Nhieu co hoi thuc tap va viec lam."
    ]
    
    reviews = []
    for i in range(count):
        rating = random.choices([5, 4, 3, 2, 1], weights=[45, 30, 15, 7, 3])[0]
        review = {
            "author": random.choice(authors),
            "rating": rating,
            "content": random.choice(positive_reviews),
            "date": datetime.now() - timedelta(days=random.randint(0, 180)),
            "likes": random.randint(0, 50),
            "source": "Google Maps"
        }
        reviews.append(review)
    
    return reviews


def setup_mongodb():
    """Setup MongoDB database and collections"""
    if not MONGODB_AVAILABLE:
        print("\n=== Generating Sample Data (MongoDB not connected) ===\n")
        
        users = generate_sample_users(50)
        jobs = generate_sample_jobs(30)
        reviews = generate_sample_reviews(100)
        
        print(f"Generated {len(users)} sample users")
        print(f"Generated {len(jobs)} sample jobs")
        print(f"Generated {len(reviews)} sample reviews")
        
        # Save to JSON files
        with open("sample_users.json", "w") as f:
            json.dump([{**u, "createdAt": str(u["createdAt"])} for u in users], f, indent=2)
        
        with open("sample_jobs.json", "w") as f:
            json.dump([{**j, "deadline": str(j["deadline"]), "createdAt": str(j["createdAt"])} for j in jobs], f, indent=2)
        
        with open("sample_reviews.json", "w") as f:
            json.dump([{**r, "date": str(r["date"])} for r in reviews], f, indent=2)
        
        print("\nSample data saved to JSON files!")
        return
    
    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017")
    db = client["gdu_career"]
    
    print("Connected to MongoDB successfully!")
    
    # Create collections with indexes
    collections_config = {
        "users": [
            {"keys": [("email", 1)], "unique": True},
            {"keys": [("role", 1)]},
        ],
        "jobs": [
            {"keys": [("status", 1)]},
            {"keys": [("type", 1)]},
            {"keys": [("company", 1)]},
            {"keys": [("createdAt", -1)]},
        ],
        "google_reviews": [
            {"keys": [("date", -1)]},
            {"keys": [("rating", 1)]},
        ],
        "applications": [
            {"keys": [("userId", 1)]},
            {"keys": [("jobId", 1)]},
            {"keys": [("status", 1)]},
        ],
    }
    
    for collection_name, indexes in collections_config.items():
        collection = db[collection_name]
        for index in indexes:
            collection.create_index(index["keys"], unique=index.get("unique", False))
        print(f"Created collection: {collection_name}")
    
    # Insert sample data
    print("\nInserting sample data...")
    
    users = generate_sample_users(50)
    db["users"].insert_many(users)
    print(f"Inserted {len(users)} users")
    
    jobs = generate_sample_jobs(30)
    db["jobs"].insert_many(jobs)
    print(f"Inserted {len(jobs)} jobs")
    
    reviews = generate_sample_reviews(100)
    db["google_reviews"].insert_many(reviews)
    print(f"Inserted {len(reviews)} reviews")
    
    print("\nMongoDB setup completed successfully!")
    
    # Print statistics
    print("\n=== Database Statistics ===")
    print(f"Users: {db['users'].count_documents({})}")
    print(f"Jobs: {db['jobs'].count_documents({})}")
    print(f"Reviews: {db['google_reviews'].count_documents({})}")


if __name__ == "__main__":
    print("=" * 50)
    print("GDU Career Portal - MongoDB Setup")
    print("=" * 50)
    setup_mongodb()
