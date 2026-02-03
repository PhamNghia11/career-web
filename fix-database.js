const { MongoClient } = require('mongodb');

async function fixDatabase() {
    const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('gdu_career');
        const collection = db.collection('users');

        // Find all users with student role
        const users = await collection.find({ role: 'student' }).toArray();

        console.log(`Found ${users.length} students to check`);

        let fixedCount = 0;
        for (const user of users) {
            const updates = {};
            let needsUpdate = false;

            // Trim and fix major field
            if (user.major) {
                const trimmedMajor = user.major.trim();
                if (trimmedMajor !== user.major) {
                    updates.major = trimmedMajor;
                    needsUpdate = true;
                }
            }

            // Trim and fix faculty field
            if (user.faculty) {
                const trimmedFaculty = user.faculty.trim();
                if (trimmedFaculty !== user.faculty) {
                    updates.faculty = trimmedFaculty;
                    needsUpdate = true;
                }
            }

            // Trim cohort
            if (user.cohort) {
                const trimmedCohort = user.cohort.trim();
                if (trimmedCohort !== user.cohort) {
                    updates.cohort = trimmedCohort;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await collection.updateOne(
                    { _id: user._id },
                    { $set: updates }
                );
                console.log(`Fixed user ${user.email}:`, updates);
                fixedCount++;
            }
        }

        console.log(`\nFixed ${fixedCount} users`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.close();
    }
}

fixDatabase();
