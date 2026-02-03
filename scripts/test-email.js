const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

function getEnvValue(key) {
    try {
        const envPath = path.resolve(process.cwd(), ".env.local");
        if (!fs.existsSync(envPath)) return null;
        const content = fs.readFileSync(envPath, "utf8");
        const lines = content.split("\n");
        for (const line of lines) {
            if (line.startsWith(key + "=")) {
                return line.substring(key.length + 1).replace(/"/g, "").trim();
            }
        }
    } catch (e) {
        return null;
    }
}

async function testEmail() {
    const user = getEnvValue("SMTP_USER");
    const pass = getEnvValue("SMTP_PASSWORD");
    const host = getEnvValue("SMTP_HOST") || "smtp.gmail.com";
    const port = 465;

    console.log(`Testing SMTP with User: ${user}, Host: ${host}, Port: ${port}`);

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: true,
        auth: {
            user,
            pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    try {
        console.log("Verifying connection...");
        await transporter.verify();
        console.log("Connection successful! Sending test email...");

        const info = await transporter.sendMail({
            from: `"Test" <${user}>`,
            to: user,
            subject: "SMTP Test",
            text: "This is a test email.",
        });

        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("SMTP Error Details:");
        console.error(error);
    }
}

testEmail();
