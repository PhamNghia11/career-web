const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

async function diagnose() {
    try {
        await client.connect();
        const db = client.db("gdu_career");

        const collections = [
            "users",
            "jobs",
            "applications",
            "companies",
            "notifications",
            "reports",
            "news"
        ];

        console.log("--- Database Diagnostic Report ---");
        for (const colName of collections) {
            const count = await db.collection(colName).countDocuments();
            const lastDoc = await db.collection(colName).find().sort({ $natural: -1 }).limit(1).toArray();
            let lastDate = "N/A";
            if (lastDoc.length > 0) {
                if (lastDoc[0].createdAt) {
                    lastDate = lastDoc[0].createdAt;
                } else if (lastDoc[0]._id) {
                    lastDate = lastDoc[0]._id.getTimestamp();
                }
            }
            console.log(`${colName}: ${count} documents (Last: ${lastDate})`);
        }

        // Check for any other databases in the cluster
        const databases = await client.db().admin().listDatabases();
        console.log("\n--- Databases in Cluster ---");
        databases.databases.forEach(dbInfo => console.log(`- ${dbInfo.name}`));

    } catch (error) {
        console.error("Diagnosis failed:", error);
    } finally {
        await client.close();
    }
}

diagnose();
