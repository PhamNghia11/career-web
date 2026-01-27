const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";
const BACKUP_DIR = "d:/chatbot/backups/2026-01-26_20-18-1";

async function restore() {
    const client = new MongoClient(MONGODB_URI);
    try {
        console.log("--- Starting Database Restoration ---");
        await client.connect();
        const db = client.db("gdu_career");

        const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));

        for (const file of files) {
            const collectionName = file.replace('.json', '');
            const filePath = path.join(BACKUP_DIR, file);

            console.log(`\nProcessing collection: [${collectionName}]`);

            const rawData = fs.readFileSync(filePath, 'utf8');
            let docs = JSON.parse(rawData);

            if (!Array.isArray(docs)) {
                console.log(` - Skip: Data in ${file} is not an array.`);
                continue;
            }

            if (docs.length === 0) {
                console.log(` - Skip: ${file} is empty.`);
                continue;
            }

            // Transform fields
            const transformedDocs = docs.map(doc => {
                // Common fields that should be ObjectId
                const objectIdFields = ['_id', 'jobId', 'employerId', 'applicantId', 'creatorId', 'userId', 'targetUserId', 'applicationId'];

                for (const key in doc) {
                    if (doc[key] && typeof doc[key] === 'string') {
                        // Check if it's an ObjectId string (24 hex chars)
                        if (objectIdFields.includes(key) && /^[0-9a-fA-F]{24}$/.test(doc[key])) {
                            doc[key] = new ObjectId(doc[key]);
                        }
                        // Check if it's an ISO date string
                        else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(doc[key])) {
                            doc[key] = new Date(doc[key]);
                        }
                    } else if (doc[key] && typeof doc[key] === 'object') {
                        // Handle potential $oid or $date from other tools
                        if (doc[key].$oid) {
                            doc[key] = new ObjectId(doc[key].$oid);
                        } else if (doc[key].$date) {
                            doc[key] = new Date(doc[key].$date);
                        }
                    }
                }
                return doc;
            });

            console.log(` - Found ${transformedDocs.length} documents in backup.`);

            // Clear existing data in the target collection?
            // Given the massive data loss, it's safer to clear and restore to avoid mess,
            // EXCEPT for visitors maybe (which is large and currently has newer data).
            if (collectionName === 'visitors') {
                console.log(" - Skip clearing for [visitors] to avoid losing today's logs.");
                // For visitors, we might want to upsert or just skip if it's too much data.
                // Let's just skip it for now or do an insertMany with ordered: false.
                continue;
            }

            console.log(` - Clearing current [${collectionName}] collection...`);
            await db.collection(collectionName).deleteMany({});

            console.log(` - Inserting ${transformedDocs.length} documents...`);
            const result = await db.collection(collectionName).insertMany(transformedDocs);
            console.log(` - RESTORED: ${result.insertedCount} documents.`);
        }

        console.log("\n--- Restoration Complete! ---");

    } catch (error) {
        console.error("Restoration failed:", error);
    } finally {
        await client.close();
    }
}

restore();
