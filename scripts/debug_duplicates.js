
const { MongoClient } = require("mongodb");

const MONGODB_URI = "mongodb://localhost:27017";

async function run() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db("gdu_career");
        const jobs = db.collection("jobs");

        // Find jobs that look like "Data Analyst Intern"
        // Regex for flexible matching
        const query = { title: { $regex: "Data Analyst Intern", $options: "i" } };

        const results = await jobs.find(query).toArray();

        console.log(`Found ${results.length} jobs matching "Data Analyst Intern":`);

        results.forEach((job, index) => {
            console.log(`\n--- Job #${index + 1} ---`);
            console.log(`ID: ${job._id} (Type: ${typeof job._id})`);
            console.log(`Title: "${job.title}" (Length: ${job.title.length})`);
            console.log(`Title Hex: ${Buffer.from(job.title).toString('hex')}`);
            console.log(`Company: "${job.company}" (Length: ${job.company.length})`);
            console.log(`Company Hex: ${Buffer.from(job.company).toString('hex')}`);
            console.log(`Type: "${job.type}"`);
            console.log(`PostedAt: ${job.postedAt}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
