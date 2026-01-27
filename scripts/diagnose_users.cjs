const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

async function diagnose() {
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const usersCollection = db.collection("users");
        const pendingCollection = db.collection("pending_users");

        console.log("--- Checking USERS Collection ---");
        const allUsers = await usersCollection.find({}).toArray();
        const emailCounts = {};
        allUsers.forEach(u => {
            emailCounts[u.email] = (emailCounts[u.email] || 0) + 1;
        });

        const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
        if (duplicates.length > 0) {
            console.log("Found duplicate emails in USERS:");
            duplicates.forEach(([email, count]) => {
                console.log(`- ${email}: ${count} records`);
                const matching = allUsers.filter(u => u.email === email);
                matching.forEach(m => {
                    console.log(`  ID: ${m._id}, Role: ${m.role}, Name: ${m.name}, Verified: ${m.emailVerified}, Status: ${m.status}, Created: ${m.createdAt}`);
                });
            });
        } else {
            console.log("No duplicate emails found in USERS.");
            // Just list users to see what's there
            allUsers.forEach(u => console.log(`- ${u.email} (${u.role}, ${u.name}, Status: ${u.status})`));
        }

        console.log("\n--- Checking PENDING_USERS Collection ---");
        const allPending = await pendingCollection.find({}).toArray();
        console.log(`Total pending users: ${allPending.length}`);
        allPending.forEach(p => {
            console.log(`- Email: ${p.email}, Role: ${p.role}, Name: ${p.name}, Created: ${p.createdAt}`);
        });

    } catch (error) {
        console.error("Diagnosis failed:", error);
    } finally {
        await client.close();
        process.exit();
    }
}

diagnose();
