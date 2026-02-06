const { MongoClient } = require('mongodb');
const path = require('path');

async function createIndexes() {
    console.log('🚀 Starting Index Creation...');

    const uri = 'mongodb://localhost:27017/gdu_career';
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db();
        console.log(`✅ Connected to database: ${db.databaseName}`);

        // 1. Jobs Collection
        const jobs = db.collection('jobs');
        console.log('🏗️  Creating indexes for [jobs]...');
        await jobs.createIndex({ status: 1 });
        await jobs.createIndex({ postedAt: -1 });
        await jobs.createIndex({ deadline: 1 });
        await jobs.createIndex({ companyId: 1 });
        console.log('✅ Jobs indexes created.');

        // 2. Applications Collection
        const apps = db.collection('applications');
        console.log('🏗️  Creating indexes for [applications]...');
        await apps.createIndex({ jobId: 1 });
        await apps.createIndex({ status: 1 });
        await apps.createIndex({ userId: 1 });
        console.log('✅ Applications indexes created.');

        // 3. Companies Collection
        const companies = db.collection('companies');
        console.log('🏗️  Creating indexes for [companies]...');
        await companies.createIndex({ slug: 1 });
        await companies.createIndex({ status: 1 });
        console.log('✅ Companies indexes created.');

        console.log('\n✨ ALL INDEXES CREATED SUCCESSFULLY');
    } catch (error) {
        console.error('\n❌ Index creation failed:');
        console.error(error);
    } finally {
        await client.close();
    }
}

createIndexes();
