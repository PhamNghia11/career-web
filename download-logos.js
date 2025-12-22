const fs = require('fs');
const https = require('https');
const path = require('path');

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        });
        request.on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

const getPageContent = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`Status ${res.statusCode}`));
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const scrapeAndDownload = async () => {
    const logosDir = path.join(__dirname, 'public', 'logos');
    if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

    const targets = [
        { name: 'fpt.png', page: 'https://commons.wikimedia.org/wiki/File:FPT_Software_Logo.png' },
        { name: 'vingroup.png', page: 'https://commons.wikimedia.org/wiki/File:Vingroup.png' },
        { name: 'techcombank.png', page: 'https://commons.wikimedia.org/wiki/File:Techcombank_logo.png' },
        { name: 'vng.svg', page: 'https://commons.wikimedia.org/wiki/File:VNG_Corp._logo.svg' },
        { name: 'shopee.svg', page: 'https://commons.wikimedia.org/wiki/File:Shopee_logo.svg' },
        { name: 'tiki.png', page: 'https://commons.wikimedia.org/wiki/File:Logo_Tiki_2023.png' }
    ];

    for (const t of targets) {
        console.log(`Processing ${t.name}...`);
        try {
            const html = await getPageContent(t.page);
            let match = html.match(/class="fullImageLink"\s*id="file"\s*><a\s*href="([^"]+)"/);
            if (!match) {
                match = html.match(/<a href="(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/[^"]+)" class="internal"/);
            }

            if (match) {
                const imgUrl = match[1];
                console.log(`Found URL: ${imgUrl}`);
                await downloadFile(imgUrl, path.join(logosDir, t.name));
                console.log(`Saved ${t.name}`);
            } else {
                console.error(`Could not find image URL for ${t.name}`);
            }
        } catch (e) {
            console.error(`Failed ${t.name}: ${e.message}`);
        }
    }
};

scrapeAndDownload();
