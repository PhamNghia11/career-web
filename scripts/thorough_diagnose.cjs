const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

const TARGET_EMAIL = "phamlenghia113dx@gmail.com";

async function diagnose() {
    const report = {
        target: TARGET_EMAIL,
        timestamp: new Date().toISOString(),
        results: {}
    };

    try {
        await client.connect();
        const db = client.db("gdu_career");

        const collectionsToCheck = ["users", "pending_users", "companies", "applications", "notifications", "saved_jobs"];

        for (const collName of collectionsToCheck) {
            const coll = db.collection(collName);
            const query = {
                $or: [
                    { email: { $regex: new RegExp(`^${TARGET_EMAIL}$`, 'i') } },
                    { userEmail: { $regex: new RegExp(`^${TARGET_EMAIL}$`, 'i') } },
                    { applicantEmail: { $regex: new RegExp(`^${TARGET_EMAIL}$`, 'i') } }
                ]
            };

            const results = await coll.find(query).toArray();
            report.results[collName] = results.map(r => ({
                _id: r._id.toString(),
                email: r.email,
                role: r.role,
                name: r.name,
                fullName: r.fullName,
                status: r.status,
                emailVerified: r.emailVerified,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt
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
