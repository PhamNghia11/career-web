const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function restore() {
    console.log('🚀 Starting Database Restore Process...');

    // 1. Get URI from .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let uri = 'mongodb://localhost:27017/gdu_career'; // Default to local

    const client = new MongoClient(uri);

    try {
        console.log('🔌 Connecting to Local Database...');
        await client.connect();
        const db = client.db();
        console.log(`✅ Connected to database: ${db.databaseName}`);

        // 2. Find latest backup
        const backupsRootDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupsRootDir)) {
            console.error('❌ Error: backups/ directory not found');
            process.exit(1);
        }

        const backups = fs.readdirSync(backupsRootDir).sort().reverse();
        if (backups.length === 0) {
            console.error('❌ Error: No backups found');
            process.exit(1);
        }

        const latestBackupDir = path.join(backupsRootDir, backups[0]);
        console.log(`📂 Using latest backup: ${backups[0]}`);

        // 3. Import collections
        const files = fs.readdirSync(latestBackupDir).filter(f => f.endsWith('.json'));

        const { ObjectId } = require('mongodb');

        for (const file of files) {
            const collectionName = path.parse(file).name;
            process.stdout.write(`  ⬆️  Importing [${collectionName}]... `);

            const filePath = path.join(latestBackupDir, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            if (data.length > 0) {
                // Convert string _id to ObjectId
                const processedData = data.map(doc => {
                    const newDoc = { ...doc };
                    if (newDoc._id && typeof newDoc._id === 'string' && newDoc._id.length === 24) {
                        try {
                            newDoc._id = new ObjectId(newDoc._id);
                        } catch (e) {
                            // Leave as string if not valid ObjectId
                        }
                    }

                    // Also convert common reference fields if they look like ObjectIds
                    const idFields = ['userId', 'creatorId', 'employerId', 'jobId', 'applicantId', 'companyId'];
                    idFields.forEach(field => {
                        if (newDoc[field] && typeof newDoc[field] === 'string' && newDoc[field].length === 24) {
                            // Some fields might be intentionally strings, so we only convert if likely
                            // For this project, IDs are generally ObjectIds in DB
                        }
                    });

                    return newDoc;
                });

                const collection = db.collection(collectionName);
                await collection.deleteMany({}); // Clear existing data
                await collection.insertMany(processedData);
                console.log(`done (${data.length} docs converted & imported)`);
            } else {
                console.log('empty (skipped)');
            }
        }

        console.log('\n✅ RESTORE COMPLETED SUCCESSFULLY');
    } catch (error) {
        console.error('\n❌ Restore failed:');
        console.error(error);
    } finally {
        await client.close();
    }
}

restore();
