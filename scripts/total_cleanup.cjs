const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

const TARGET_EMAILS = ["nagaki50023010@gmail.com", "employer@company.com", "cvhduyen1612005@gmail.com"];

async function cleanup() {
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const usersCollection = db.collection("users");
        const pendingCollection = db.collection("pending_users");

        console.log("--- Starting Database Cleanup ---");

        for (const email of TARGET_EMAILS) {
            console.log(`\nProcessing email: ${email}`);

            // 1. Check for Student account in USERS that might be "junk"
            const studentRecord = await usersCollection.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') },
                role: "student"
            });

            if (studentRecord) {
                console.log(`Found old Student account: ${studentRecord._id}. Deleting...`);
                await usersCollection.deleteOne({ _id: studentRecord._id });
            }

            // 2. Check for ANY duplicates in USERS (just in case)
            const allUsers = await usersCollection.find({ email: { $regex: new RegExp(`^${email}$`, 'i') } }).toArray();
            if (allUsers.length > 1) {
                console.log(`Found ${allUsers.length} total records for ${email} in USERS. Cleaning up all but the most recent...`);
                // Sort by createdAt desc (if available) or _id desc
                allUsers.sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());
                const toDelete = allUsers.slice(1);
                for (const doc of toDelete) {
                    console.log(`Deleting older duplicate: ${doc._id} (${doc.role})`);
                    await usersCollection.deleteOne({ _id: doc._id });
                }
            }
        }

        console.log("\n--- Enforcing Unique Email Index ---");
        try {
            // First, normalize all existing emails to lowercase to avoid index failures
            const allDocs = await usersCollection.find({}).toArray();
            for (const doc of allDocs) {
                if (doc.email) {
                    await usersCollection.updateOne(
                        { _id: doc._id },
                        { $set: { email: doc.email.toLowerCase().trim() } }
                    );
                }
            }

            // Create the unique index
            await usersCollection.createIndex({ email: 1 }, { unique: true });
            console.log("Unique index on 'email' field created successfully.");
        } catch (indexError) {
            console.error("Failed to create unique index (might be existing duplicates):", indexError);
        }

        console.log("\nCleanup and index enforcement complete.");

    } catch (error) {
        console.error("Cleanup failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

cleanup();
