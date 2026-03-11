const { MongoClient } = require('mongodb');

async function listApps() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('gdu_career');
        const apps = db.collection('applications');

        const latestApps = await apps.find().sort({ createdAt: -1 }).limit(10).toArray();
        console.log("--- Latest 10 Applications ---");
        latestApps.forEach(app => {
            console.log(`ID: ${app._id}, Name: ${app.fullname}, CV Path: ${app.cvPath}, CreatedAt: ${app.createdAt}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

listApps();
