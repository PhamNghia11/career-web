const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

let mongodbUri = 'mongodb://127.0.0.1:27017/gdu_career';
try {
    const envContent = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
    const match = envContent.match(/MONGODB_URI=([^\s]+)/);
    if (match) mongodbUri = match[1];
} catch (e) { }

async function main() {
    const client = new MongoClient(mongodbUri);
    try {
        await client.connect();
        const admin = client.db().admin();
        const dbsInfo = await admin.listDatabases();

        for (const dbInfo of dbsInfo.databases) {
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            console.log(`DB: ${dbInfo.name} | Collections: ${collections.map(c => c.name).join(', ')}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}
main();
