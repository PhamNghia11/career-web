/**
 * MongoDB Connection Utility
 *
 * For local development with VSCode:
 * 1. Install MongoDB Community Server: https://www.mongodb.com/try/download/community
 * 2. Start MongoDB service: mongod --dbpath /path/to/data
 * 3. Set environment variable: MONGODB_URI=mongodb://localhost:27017/gdu_career
 *
 * Or use MongoDB Atlas (cloud):
 * 1. Create free cluster at https://cloud.mongodb.com
 * 2. Get connection string and set MONGODB_URI environment variable
 */

import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gdu_career"

// Global definition to persist connection across hot reloads in development
// and potentially across function invocations in Vercel if the container is reused.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (!process.env.MONGODB_URI && process.env.NODE_ENV === "production") {
  throw new Error("Please add your Mongo URI to .env.local")
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI)
  clientPromise = client.connect()
}

// We'll export this mostly for NextAuth if used, but also reuse it for our helpers
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    const connectedClient = await clientPromise
    const db = connectedClient.db("gdu_career")
    return { client: connectedClient, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function getCollection(collectionName: string) {
  const { db } = await connectToDatabase()
  return db.collection(collectionName)
}

// Collection names
export const COLLECTIONS = {
  USERS: "users",
  JOBS: "jobs",
  APPLICATIONS: "applications",
  REVIEWS: "google_reviews",
  DAILY_UPDATES: "daily_updates",
  COMPANIES: "companies",
  REVIEW_LIKES: "review_likes",
  REVIEW_COMMENTS: "review_comments",
  USER_REVIEWS: "user_reviews",
  SAVED_JOBS: "saved_jobs",
  CONTACTS: "contacts",
  NOTIFICATIONS: "notifications",
  VISITORS: "visitors",
  REPORTS: "reports",
  PENDING_USERS: "pending_users",
  NEWS: "news",
  HERO_SLIDES: "hero_slides",
  SITE_CONFIGS: "site_configs",
} as const
