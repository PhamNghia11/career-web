const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const client = new MongoClient(uri);

async function finalCheck() {
    try {
        await client.connect();
        const db = client.db("gdu_career");
        const usersColl = db.collection("users");
        const pendingColl = db.collection("pending_users");

        console.log("--- Checking for Duplicates in [users] ---");
        const users = await usersColl.find({}).toArray();
        const userEmails = users.map(u => u.email.toLowerCase());
        const userDuplicates = userEmails.filter((e, i) => userEmails.indexOf(e) !== i);

        if (userDuplicates.length > 0) {
            console.log(`CRITICAL: Found ${userDuplicates.length} duplicates in users collection!`);
            console.log(userDuplicates);
        } else {
            console.log("Success: No duplicates found in [users] collection.");
        }

        console.log("\n--- Checking for Duplicates in [pending_users] ---");
        const pending = await pendingColl.find({}).toArray();
        const pendingEmails = pending.map(p => p.email.toLowerCase());
        const pendingDuplicates = pendingEmails.filter((e, i) => pendingEmails.indexOf(e) !== i);

        if (pendingDuplicates.length > 0) {
            console.log(`Notice: Found ${pendingDuplicates.length} duplicates in pending_users collection.`);
            console.log(pendingDuplicates);
        } else {
            console.log("Success: No duplicates found in [pending_users] collection.");
        }

        console.log("\n--- Checking for Cross-Collection Conflicts (users vs pending) ---");
        const conflicts = pendingEmails.filter(e => userEmails.includes(e));
        if (conflicts.length > 0) {
            console.log(`Notice: Found ${conflicts.length} emails that exist in both collections (this is normal during re-registration but will be resolved on verification).`);
            console.log(conflicts);
        } else {
            console.log("No cross-collection conflicts found.");
        }

    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await client.close();
        process.exit();
    }
}

finalCheck();
