const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

async function findAndUpdateUser() {
    const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('gdu_career');
        const collection = db.collection('users');
        const user = await collection.findOne({ email: 'nvmkdtnvt010305@gmail.com' });

        if (user) {
            const userId = user._id;

            // Write to file
            fs.writeFileSync('user_id.txt', userId.toHexString());
            console.log('User ID written to user_id.txt');

            // Test update directly using the found ObjectId
            const result = await collection.updateOne(
                { _id: userId },
                {
                    $set: {
                        major: "Kế toán",
                        faculty: "Tài chính ngân hàng",
                        cohort: "K19",
                        updatedAt: new Date()
                    }
                }
            );

            console.log('Update result:', JSON.stringify(result, null, 2));

            // Verify
            const updated = await collection.findOne({ _id: userId });
            console.log('After update - major:', updated.major);
            console.log('After update - faculty:', updated.faculty);
            console.log('After update - cohort:', updated.cohort);
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.close();
    }
}

findAndUpdateUser();
