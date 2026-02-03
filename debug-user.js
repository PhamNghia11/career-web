const { MongoClient } = require('mongodb');

async function findUser() {
    const uri = "mongodb+srv://admin:0268541395%40plN@cluster0.wkvcpro.mongodb.net/gdu_career?appName=Cluster0";

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db('gdu_career');
        const collection = db.collection('users');
        const user = await collection.findOne({ email: 'lehoangphuc14122003@gmail.com' });

        if (user) {
            console.log('--- KEYS ---');
            Object.keys(user).sort().forEach(key => {
                console.log(key);
            });
            console.log('--- VALUES ---');
            console.log('name:', user.name);
            console.log('fullname:', user.fullname);
            console.log('studentId:', user.studentId);
            console.log('major:', user.major);
            console.log('--- END ---');
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

findUser();
