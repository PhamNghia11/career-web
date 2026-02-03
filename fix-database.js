const { MongoClient } = require('mongodb');

async function fixDatabase() {
    const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('gdu_career');
        const collection = db.collection('users');

        const users = await collection.find({ role: 'student' }).toArray();
        console.log(`Checking ${users.length} students...`);

        let fixedCount = 0;
        for (const user of users) {
            const updates = {};
            let needsUpdate = false;

            // Fix Major: Trim and replace dashes
            if (user.major) {
                let fixedMajor = user.major.trim().replace(" - ", " ");
                if (fixedMajor === "Tài chính ngân hàng" || fixedMajor === "Tài chính - Ngân hàng") {
                    fixedMajor = "Tài chính ngân hàng";
                }
                if (fixedMajor !== user.major) {
                    updates.major = fixedMajor;
                    needsUpdate = true;
                }
            }

            // Fix Faculty: Trim and replace dashes
            if (user.faculty) {
                let fixedFaculty = user.faculty.trim().replace(" - ", " ");
                if (fixedFaculty === "Tài chính ngân hàng" || fixedFaculty === "Tài chính - Ngân hàng") {
                    fixedFaculty = "Tài chính ngân hàng";
                }
                if (fixedFaculty !== user.faculty) {
                    updates.faculty = fixedFaculty;
                    needsUpdate = true;
                }
            }

            if (user.cohort) {
                const fixedCohort = user.cohort.trim();
                if (fixedCohort !== user.cohort) {
                    updates.cohort = fixedCohort;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await collection.updateOne({ _id: user._id }, { $set: updates });
                console.log(`Fixed user ${user.email}:`, updates);
                fixedCount++;
            }
        }

        console.log(`\nFixed ${fixedCount} users total.`);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

fixDatabase();
