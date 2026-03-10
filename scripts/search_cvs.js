const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017/gdu_career';
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        const db = client.db('gdu_career');
        const collection = db.collection('applications');

        console.log('--- Applications with cvBase64 ---');
        const appsWithB64 = await collection.find({ cvBase64: { $exists: true, $ne: '' } }).limit(5).toArray();
        appsWithB64.forEach(a => {
            console.log(`ID: ${a._id}, Name: ${a.fullname}, B64 Len: ${a.cvBase64.length}, Mime: ${a.cvMimeType}`);
        });

        console.log('\n--- Applications with cvPath ---');
        const appsWithPath = await collection.find({ cvPath: { $exists: true, $ne: '' } }).limit(5).toArray();
        appsWithPath.forEach(a => {
            console.log(`ID: ${a._id}, Name: ${a.fullname}, Path: ${a.cvPath}, Original: ${a.cvOriginalName}`);
        });

    } finally {
        await client.close();
    }
}
run();
