// Quick test to verify Cloudinary upload works
require('dotenv').config({ path: 'd:/chatbot/.env.local' });
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "SET" : "MISSING");
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING");

// Create a tiny test PDF buffer
const testPdfContent = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF');

const dataUri = `data:application/pdf;base64,${testPdfContent.toString('base64')}`;

async function testUpload() {
    try {
        console.log("\nTesting Cloudinary upload...");
        const result = await cloudinary.uploader.upload(dataUri, {
            folder: 'gdu-career/cvs',
            resource_type: 'auto',
        });
        console.log("SUCCESS! URL:", result.secure_url);
        console.log("Public ID:", result.public_id);

        // Clean up test file
        await cloudinary.uploader.destroy(result.public_id, { resource_type: result.resource_type });
        console.log("Test file cleaned up.");
    } catch (e) {
        console.error("CLOUDINARY UPLOAD FAILED:", e.message);
        console.error("Full error:", JSON.stringify(e, null, 2));
    }
}

testUpload();
