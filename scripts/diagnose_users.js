import { getCollection, COLLECTIONS } from "../src/database/connection.js";

async function diagnose() {
    try {
        const usersCollection = await getCollection(COLLECTIONS.USERS);
        const pendingCollection = await getCollection(COLLECTIONS.PENDING_USERS);

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
                    console.log(`  ID: ${m._id}, Role: ${m.role}, Name: ${m.name}, Verified: ${m.emailVerified}, Created: ${m.createdAt}`);
                });
            });
        } else {
            console.log("No duplicate emails found in USERS.");
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
        process.exit();
    }
}

diagnose();
