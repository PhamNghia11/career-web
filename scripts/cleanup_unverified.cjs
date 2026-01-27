const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

async function cleanup() {
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const usersColl = db.collection("users");
        const pendingColl = db.collection("pending_users");

        console.log("--- Starting Unverified User Cleanup ---");

        // 1. Delete from users collection where emailVerified is not true
        // We keep accounts where emailVerified is true. Everything else goes.
        const unverifiedResult = await usersColl.deleteMany({
            emailVerified: { $ne: true }
        });
        console.log(`Deleted ${unverifiedResult.deletedCount} unverified users from [users] collection.`);

        // 2. Clear all pending users to allow fresh registration
        const pendingResult = await pendingColl.deleteMany({});
        console.log(`Deleted ${pendingResult.deletedCount} records from [pending_users] collection.`);

        console.log("\nCleanup complete. The system is now restricted to verified data only.");

    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        await client.close();
        process.exit();
    }
}

cleanup();
