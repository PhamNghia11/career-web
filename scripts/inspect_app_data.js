const { MongoClient, ObjectId } = require('mongodb');

async function debugApp(appId) {
    const uri = "mongodb://localhost:27017"; // Adjust if needed
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('gdu_career');
        const apps = db.collection('applications');

        const app = await apps.findOne({ _id: new ObjectId(appId) });
        if (!app) {
            console.log("Application not found:", appId);
            return;
        }

        console.log("--- Application Data ---");
        console.log("ID:", app._id);
        console.log("Fullname:", app.fullname);
        console.log("cvMimeType:", app.cvMimeType);
        console.log("cvOriginalName:", app.cvOriginalName);
        console.log("cvPath:", app.cvPath);
        console.log("cvBase64 length:", app.cvBase64?.length || 0);
        console.log("cvBase64 start:", app.cvBase64?.substring(0, 100));

        // Debug regex check matching our frontend logic
        const cvMimeType = app.cvMimeType || "";
        const cvOriginalName = app.cvOriginalName || "";

        const isWordMime = cvMimeType.toLowerCase().includes("msword") || cvMimeType.toLowerCase().includes("wordprocessingml");
        const isWordExt = cvOriginalName.toLowerCase().endsWith(".docx") || cvOriginalName.toLowerCase().endsWith(".doc");

        console.log("--- Frontend Logic Check ---");
        console.log("isWordMime:", isWordMime);
        console.log("isWordExt:", isWordExt);
        console.log("FINAL isWordDoc:", isWordMime || isWordExt);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// Check for the known problematic ID from previous search
const targetId = "698172f87aa52f7a17e7224a"; // Based on earlier logs
debugApp(targetId);
