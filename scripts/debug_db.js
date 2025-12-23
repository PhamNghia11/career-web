const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/gdu_career";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("gdu_career");

        const mockCount = await db.collection("users").countDocuments({ name: "Nguyen Van A" });
        console.log(`Mock Users (Nguyen Van A) in DB: ${mockCount}`);

        const totalCount = await db.collection("users").countDocuments({});
        console.log(`Total Users in DB: ${totalCount}`);

        const users = await db.collection("users").find({}, { projection: { name: 1, email: 1 } }).limit(5).toArray();
        console.log("First 5 users in DB:");
        users.forEach(u => console.log(`- ${u.name} (${u.email})`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();
