const { MongoClient } = require('mongodb');

async function fix() {
    console.log('🚀 Fixing Admin 2FA status...');
    const uri = 'mongodb://localhost:27017/gdu_career';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const result = await db.collection('users').updateMany(
            { role: 'admin' },
            { $set: { totpEnabled: false } }
        );
        console.log(`✅ Success: Disabled TOTP for ${result.modifiedCount} admin accounts.`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

fix();
