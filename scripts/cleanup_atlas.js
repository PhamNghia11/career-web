const { MongoClient } = require("mongodb");
const fs = require('fs');
const path = require('path');

function getEnvValue(key) {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.startsWith(key + '=')) {
                    return line.substring(key.length + 1).replace(/"/g, '').trim();
                }
            }
        }
    } catch (e) { }
    return null;
}

const uri = getEnvValue('MONGODB_URI');

const mockEmails = [
    "nguyenvana@gdu.edu.vn",
    "tranthib@gdu.edu.vn",
    "hr@fpt.com.vn",
    "levanc@gdu.edu.vn"
    // "admin@gdu.edu.vn" // Skipping admin to be safe
];

async function run() {
    if (!uri) { return; }
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db("gdu_career");

        const result = await db.collection("users").deleteMany({
            email: { $in: mockEmails }
        });

        console.log(`Deleted ${result.deletedCount} mock users from Atlas.`);

        const allUsers = await db.collection("users").find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
        console.log("Current Users in Atlas (with roles):");
        allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) - Role: "${u.role}"`));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();
