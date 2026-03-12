const { MongoClient, ObjectId } = require('mongodb');

async function exhaustiveDebug() {
    const uri = "mongodb://127.0.0.1:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const dbs = await client.db().admin().listDatabases();
        
        console.log("Searching for 'applications' collections across all databases...");
        for (const dbInfo of dbs.databases) {
            const db = client.db(dbInfo.name);
            const collections = await db.listCollections().toArray();
            if (collections.some(c => c.name === 'applications')) {
                const count = await db.collection('applications').countDocuments();
                console.log(`FOUND in DB [${dbInfo.name}]: 'applications' col has ${count} docs`);
                
                const duyenApps = await db.collection('applications').find({
                    $or: [
                        { fullname: /Duyen/i },
                        { fullname: /Cao/i }
                    ]
                }).toArray();
                
                if (duyenApps.length > 0) {
                    console.log(`  -> Found ${duyenApps.length} matches for Duyen/Cao:`);
                    duyenApps.forEach(a => {
                        console.log(`     ID: ${a._id}, Name: ${a.fullname}, Job: ${a.jobTitle}, Created: ${a.createdAt}`);
                    });
                }
            }
        }
        
        console.log("\nInspecting specific record 698172f87aa52f7a17e7224a in gdu_career...");
        const spec = await client.db('gdu_career').collection('applications').findOne({ _id: new ObjectId('698172f87aa52f7a17e7224a') });
        if (spec) {
            console.log(JSON.stringify(spec, null, 2));
        } else {
            console.log("Record not found in gdu_career.applications");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

exhaustiveDebug();
