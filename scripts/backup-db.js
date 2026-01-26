const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced Database Backup Script
 * - Automated collection export to JSON
 * - Progress tracking
 * - Backup rotation (keeps last 7 days)
 * - Detailed summary report
 */

async function backup() {
    console.log('🚀 Starting Database Backup Process...');
    const startTime = Date.now();

    // 1. Get URI from .env.local
    const envPath = path.join(__dirname, '..', '.env.local');
    let uri = process.env.MONGODB_URI;

    if (!uri && fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/MONGODB_URI=(.+)/);
        if (match) {
            uri = match[1].trim().replace(/^["']|["']$/g, '');
        }
    }

    if (!uri) {
        console.error('❌ Error: MONGODB_URI not found in .env.local');
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        console.log('🔌 Connecting to Cloud Database...');
        await client.connect();

        const db = client.db();
        const dbName = db.databaseName;
        console.log(`✅ Connected to database: ${dbName}`);

        const collections = await db.listCollections().toArray();
        console.log(`📦 Found ${collections.length} collections to backup.`);

        // 2. Create backup directory
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + now.getHours() + '-' + now.getMinutes() + '-' + now.getSeconds();
        const backupsRootDir = path.join(__dirname, '..', 'backups');
        const currentBackupDir = path.join(backupsRootDir, timestamp);

        if (!fs.existsSync(currentBackupDir)) {
            fs.mkdirSync(currentBackupDir, { recursive: true });
        }

        let totalDocs = 0;

        // 3. Export Collections
        for (const col of collections) {
            const name = col.name;
            process.stdout.write(`  ⬇️  Exporting [${name}]... `);

            const data = await db.collection(name).find({}).toArray();
            const filePath = path.join(currentBackupDir, `${name}.json`);

            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
            totalDocs += data.length;

            console.log(`done (${data.length} docs)`);
        }

        // 4. Backup Rotation (Delete backups older than 7 days)
        console.log('🧹 Checking for old backups...');
        const retentionDays = 7;
        const files = fs.readdirSync(backupsRootDir);
        const nowMs = Date.now();

        for (const file of files) {
            const filePath = path.join(backupsRootDir, file);
            const stats = fs.statSync(filePath);
            const ageDays = (nowMs - stats.mtimeMs) / (1000 * 60 * 60 * 24);

            if (ageDays > retentionDays) {
                console.log(`  🗑️  Removing old backup: ${file}`);
                fs.rmSync(filePath, { recursive: true, force: true });
            }
        }

        // 5. Final Summary
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n' + '='.repeat(40));
        console.log('🎉 BACKUP COMPLETED SUCCESSFULLLY');
        console.log('='.repeat(40));
        console.log(`📅 Timestamp:  ${timestamp}`);
        console.log(`📂 Location:   /backups/${timestamp}`);
        console.log(`📊 Stats:      ${collections.length} collections, ${totalDocs} documents`);
        console.log(`⏱️  Duration:   ${duration}s`);
        console.log('='.repeat(40) + '\n');

    } catch (error) {
        console.error('\n❌ Backup failed visualization:');
        console.error(error);
    } finally {
        await client.close();
    }
}

backup();
