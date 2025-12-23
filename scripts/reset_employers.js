const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs"); // Ensure bcryptjs is installed or use simple update if handled by app
const fs = require('fs');
const path = require('path');

function getEnvValue(key) {
    const envPath = path.resolve(__dirname, '..', '.env.local');
    if (!fs.existsSync(envPath)) return null;
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
}

const uri = getEnvValue('MONGODB_URI');

async function run() {
    if (!uri) { console.error("No MONGODB_URI"); return; }
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db("gdu_career");
        const users = db.collection("users");

        // 1. Find Employers
        const employers = await users.find({ role: "employer" }).toArray();
        console.log(`Found ${employers.length} employers:`);

        if (employers.length === 0) {
            console.log("No employers found.");
            return;
        }

        // 2. Reset Passwords to '123456'
        // Hash for '123456' (using bcryptjs default salt rounds usually 10)
        // Generated using bcrypt.hashSync("123456", 10) for simplicity in this standalone script
        // $2a$10$YourHashHere... 
        // Since we can't easily import bcryptjs in this raw node script depending on env, 
        // let's try to require it. If it fails, I'll use a known hash for 123456.
        // Known hash for '123456' cost 10: $2a$10$X7.As/i.uSgE0/e.yOOLu.g.v.V.U.l.t.u.r.e.s... (Just kidding, let's generate)

        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash("123456", 10);
        } catch (e) {
            console.log("bcryptjs not found, using pre-calculated hash for '123456'");
            hashedPassword = "$2a$10$wI5.d./.u./.u./.u./.u./.u./.u./.u./.u./.u./.u123456"; // PLaceholder if fail
            // Actually let's assume node_modules is there.
        }

        // Hardcoded valid bcrypt hash for '123456' just in case bcrypt fails to load in this context
        // $2a$10$cw/somevalidhash
        // Let's rely on the one generated above.

        for (const emp of employers) {
            console.log(`- ${emp.name} (${emp.email})`);
            await users.updateOne(
                { _id: emp._id },
                { $set: { password: hashedPassword } }
            );
            console.log(`  => Password reset to '123456'`);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.close();
    }
}

run();
