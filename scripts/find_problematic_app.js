const { MongoClient } = require('mongodb');

async function findApp() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('gdu_career');
        const apps = db.collection('applications');

        const app = await apps.findOne({ fullname: "Ăn hết gái xinh trong trường" });
        if (!app) {
            console.log("Application not found for name: Ăn hết gái xinh trong trường");
            // Search case-insensitively just in case
            const regexSearch = await apps.findOne({ fullname: { $regex: "Ăn hết gái xinh", $options: "i" } });
            console.log("Regex search result:", regexSearch ? { id: regexSearch._id, fullname: regexSearch.fullname, cvPath: regexSearch.cvPath } : "None");
            return;
        }

        console.log("--- Application Found ---");
        console.log("ID:", app._id);
        console.log("Fullname:", app.fullname);
        console.log("cvPath:", app.cvPath);
        console.log("cvMimeType:", app.cvMimeType);
        console.log("cvOriginalName:", app.cvOriginalName);
        console.log("cvBase64 length:", app.cvBase64?.length || 0);

        if (app.cvPath && !app.cvPath.startsWith("http")) {
            const fs = require('fs');
            const path = require('path');
            const fullPath = path.join('d:/chatbot', app.cvPath.startsWith('/') ? app.cvPath.substring(1) : app.cvPath);
            console.log("Searching for local file at:", fullPath);
            if (fs.existsSync(fullPath)) {
                console.log("File EXISTS on disk.");
            } else {
                console.log("File DOES NOT EXIST on disk.");
                // Try alternate paths
                const altPath = fullPath.replace("uploads/", "");
                console.log("Trying alt path:", altPath);
                if (fs.existsSync(altPath)) {
                    console.log("File EXISTS at alt path.");
                } else {
                    console.log("File MISSING from both locations.");
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

findApp();
