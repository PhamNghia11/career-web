const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

const TARGET_EMAIL = "nagaki50023010@gmail.com";

async function diagnose() {
    try {
        await client.connect();
        const db = client.db("gdu_career");

        const users = await db.collection("users").find({ email: { $regex: new RegExp(`^${TARGET_EMAIL}$`, 'i') } }).toArray();
        const pending = await db.collection("pending_users").find({ email: { $regex: new RegExp(`^${TARGET_EMAIL}$`, 'i') } }).toArray();

        console.log(`--- Results for ${TARGET_EMAIL} ---`);
        console.log(`USERS count: ${users.length}`);
        users.forEach(u => console.log(`  _id: ${u._id}, Role: ${u.role}, Created: ${u.createdAt}`));

        console.log(`PENDING counts: ${pending.length}`);
        pending.forEach(p => console.log(`  _id: ${p._id}, Role: ${p.role}, Created: ${p.createdAt}, OTP Hashed: ${p.emailOtp}`));

    } catch (error) {
        console.error("Diagnosis failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

diagnose();
