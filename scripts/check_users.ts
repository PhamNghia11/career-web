import { connectToDatabase, COLLECTIONS } from "../lib/mongodb";

async function checkUsers() {
    try {
        const { db } = await connectToDatabase();
        const users = await db.collection(COLLECTIONS.USERS).find({}).toArray();
        console.log(`Found ${users.length} users in database.`);
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

checkUsers();
