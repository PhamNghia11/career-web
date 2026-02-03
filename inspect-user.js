const { MongoClient } = require('mongodb');

async function inspectUser() {
    const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('gdu_career');
        const collection = db.collection('users');
        const user = await collection.findOne({ email: 'nvmkdtnvt010305@gmail.com' });

        if (user) {
            console.log('--- RAW USER DATA ---');
            console.log('Role:', JSON.stringify(user.role));
            console.log('Major:', JSON.stringify(user.major));
            console.log('Faculty:', JSON.stringify(user.faculty));
            console.log('---------------------');
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

inspectUser();
