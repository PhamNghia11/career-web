const fs = require('fs');
const path = require('path');

const logFile = 'd:/chatbot/scripts/debug.log';
const routeFile = 'd:/chatbot/src/app/api/applications/route.ts';
let content = fs.readFileSync(routeFile, 'utf8');

const logCode = `
    try {
        const fs = require('fs');
        const logMsg = \`[\${new Date().toISOString()}] POST /api/applications request received\\n\`;
        fs.appendFileSync('d:/chatbot/scripts/debug.log', logMsg);
    } catch (e) {}
`;

if (!content.includes('fs.appendFileSync(\'d:/chatbot/scripts/debug.log\'')) {
    const newContent = content.replace(
        'export async function POST(request: Request) {',
        `export async function POST(request: Request) { ${logCode}`
    );
    fs.writeFileSync(routeFile, newContent);
    console.log('Modified route file with file-based logging');
} else {
    console.log('Logging already present');
}

// Create the log file if it doesn't exist
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '');
}
