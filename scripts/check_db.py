from pymongo import MongoClient

try:
    client = MongoClient("mongodb://localhost:27017/")
    dbs = client.list_database_names()
    print("Databases found:", dbs)

    if "gdu_career" in dbs:
        db = client["gdu_career"]
        cols = db.list_collection_names()
        print("\nCollections in 'gdu_career':")
        for c in cols:
            print(f"- {c}")
            # Count docs
            count = db[c].count_documents({})
            print(f"  Count: {count}")
    else:
        print("\nDatabase 'gdu_career' NOT FOUND.")
        
except Exception as e:
    print("Error:", e)
