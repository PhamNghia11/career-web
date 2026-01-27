const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

const TARGET_EMAIL = "nagaki50023010@gmail.com";

async function diagnose() {
    const report = {
        target: TARGET_EMAIL,
        timestamp: new Date().toISOString(),
        results: {}
    };

    try {
        await client.connect();
        const db = client.db("gdu_career");

        const collectionsToCheck = ["users", "pending_users"];

        for (const collName of collectionsToCheck) {
            const coll = db.collection(collName);
            const query = { email: { $regex: new RegExp(`^${TARGET_EMAIL}$`, 'i') } };

            const results = await coll.find(query).toArray();
            report.results[collName] = results.map(r => ({
                _id: r._id.toString(),
                email: r.email,
                role: r.role,
                name: r.name,
                status: r.status,
                emailVerified: r.emailVerified,
                createdAt: r.createdAt
            }));
        }

        fs.writeFileSync('scripts/diagnosis_report.json', JSON.stringify(report, null, 2), 'utf8');
        console.log("Diagnostic report saved to scripts/diagnosis_report.json");

    } catch (error) {
        console.error("Diagnosis failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

diagnose();
