const { MongoClient } = require('mongodb');

async function restore2FA() {
    console.log('🚀 Restoring Admin 2FA status...');
    const uri = 'mongodb://localhost:27017/gdu_career';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        const result = await db.collection('users').updateMany(
            { role: 'admin' },
            { $set: { totpEnabled: true } }
        );
        console.log(`✅ Success: Re-enabled TOTP for ${result.modifiedCount} admin accounts.`);
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

restore2FA();
