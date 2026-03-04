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

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gdu_career"

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

// MongoDB Atlas connection options for stability on Serverless (Vercel)
const options = {
  connectTimeoutMS: 5000,   // Faster timeout to fail fast and retry
  socketTimeoutMS: 30000,  // Standard socket timeout
  maxPoolSize: 5,          // Increased slightly for better concurrency in complex handlers
  minPoolSize: 0,
  maxIdleTimeMS: 10000,    // Close idle connections to stay within limits
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR.
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production (Vercel), we also want to cache the connection promise
  // in the global scope if possible, though Vercel containers are ephemeral.
  // This is a standard pattern for MongoDB + Next.js.
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
}

// Helper to get connected client and db
export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  try {
    // If for some reason clientPromise became undefined, re-initialize
    if (!clientPromise && !global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, options)
      clientPromise = client.connect()
      global._mongoClientPromise = clientPromise
    } else if (!clientPromise) {
      clientPromise = global._mongoClientPromise!
    }

    console.time("db-connect")
    const connectedClient = await clientPromise
    console.timeEnd("db-connect")

    const db = connectedClient.db("gdu_career")
    return { client: connectedClient, db }
  } catch (error) {
    console.timeEnd("db-connect") // Clear timer on error
    console.error("Failed to connect to MongoDB:", error)
    // Clear the promise so next request can try again
    global._mongoClientPromise = undefined
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
