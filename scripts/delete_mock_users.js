const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017/gdu_career";

const mockEmails = [
    "nguyenvana@gdu.edu.vn",
    "tranthib@gdu.edu.vn",
    "hr@fpt.com.vn",
    "levanc@gdu.edu.vn",
    "admin@gdu.edu.vn"
];

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("gdu_career");

        const result = await db.collection("users").deleteMany({
            email: { $in: mockEmails }
        });

        console.log(`Deleted ${result.deletedCount} mock users.`);

        const remaining = await db.collection("users").countDocuments({});
        console.log(`Remaining users: ${remaining}`);

        const allUsers = await db.collection("users").find({}, { projection: { name: 1, email: 1 } }).toArray();
        console.log("Current Users in DB:");
        allUsers.forEach(u => console.log(`- ${u.name} (${u.email})`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();
