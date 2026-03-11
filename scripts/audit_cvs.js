const { MongoClient } = require('mongodb');
const fs = require('fs');

async function auditAll() {
    const c = new MongoClient('mongodb://localhost:27017');
    await c.connect();
    const apps = await c.db('gdu_career').collection('applications').find().toArray();

    const lines = apps.map(a => {
        const p = a.cvPath || '(none)';
        const b = a.cvBase64 || '';
        return [
            `ID: ${a._id}`,
            `Name: ${a.fullname}`,
            `Mime: ${a.cvMimeType || '?'}`,
            `OrigName: ${a.cvOriginalName || '?'}`,
            `cvPath: ${p.substring(0, 80)}`,
            `b64Len: ${b.length}`,
            `b64Start: ${b.substring(0, 80)}`,
            '---'
        ].join('\n');
    });

    fs.writeFileSync('d:/chatbot/scripts/cv_audit.txt', lines.join('\n'));
    console.log('Written', apps.length, 'records to cv_audit.txt');
    await c.close();
}

auditAll();
