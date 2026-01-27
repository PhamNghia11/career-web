const { MongoClient } = require('mongodb');
const fs = require('fs');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

async function listAll() {
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const users = await db.collection("users").find({}).toArray();
        const pending = await db.collection("pending_users").find({}).toArray();

        const report = {
            users: users.map(u => ({
                _id: u._id.toString(),
                email: u.email,
                role: u.role,
                name: u.name,
                fullName: u.fullName,
                status: u.status,
                emailVerified: u.emailVerified,
                createdAt: u.createdAt
            })),
            pending: pending.map(p => ({
                _id: p._id.toString(),
                email: p.email,
                role: p.role,
                name: p.name,
                status: p.status,
                createdAt: p.createdAt
            }))
        };

        fs.writeFileSync('scripts/all_users_report.json', JSON.stringify(report, null, 2), 'utf8');
        console.log("All users report saved to scripts/all_users_report.json");

    } catch (error) {
        console.error("Failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

listAll();
