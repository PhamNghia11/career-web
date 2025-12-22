import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected successfully to server");

        const admin = client.db().admin();
        const dbs = await admin.listDatabases();
        console.log("Databases:");
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

        const targetDb = "gdu_career";
        const db = client.db(targetDb);
        const collections = await db.listCollections().toArray();

        if (collections.length > 0) {
            console.log(`\nCollections in '${targetDb}':`);
            for (const col of collections) {
                console.log(` - ${col.name}`);
                const count = await db.collection(col.name).countDocuments();
                console.log(`   Count: ${count}`);
            }
        } else {
            console.log(`\nDatabase '${targetDb}' (or collections) not found/empty.`);
        }

    } finally {
        await client.close();
    }
}
run().catch(console.dir);
