const fs = require('fs');
const path = require('path');

const relativePath = "/uploads/cvs/448d1c6e-4424-4691-893f-763428d01150.pdf";
const rootDir = "d:/chatbot";

const fullPath = path.join(rootDir, relativePath.startsWith('/') ? relativePath.substring(1) : relativePath);
console.log("Checking:", fullPath);

if (fs.existsSync(fullPath)) {
    console.log("RESULT: File EXISTS on disk.");
    const stats = fs.statSync(fullPath);
    console.log("Size:", stats.size, "bytes");
} else {
    console.log("RESULT: File DOES NOT EXIST on disk.");
    // Try without leading slash
    const altPath = path.join(rootDir, relativePath);
    console.log("Checking alt:", altPath);
    if (fs.existsSync(altPath)) {
        console.log("RESULT: File EXISTS on disk (alt path).");
    } else {
        // Try without 'uploads/'
        const noUploadsPath = path.join(rootDir, relativePath.replace("/uploads/", ""));
        console.log("Checking no-uploads:", noUploadsPath);
        if (fs.existsSync(noUploadsPath)) {
            console.log("RESULT: File EXISTS at no-uploads path.");
        } else {
            console.log("RESULT: File COMPLETELY MISSING.");
        }
    }
}
