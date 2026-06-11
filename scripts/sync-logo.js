const fs = require('fs');
const path = require('path');
const https = require('https');

const logoUrl = 'https://ojhminrrkkxwyybpgvrs.supabase.co/storage/v1/object/public/job-images/logo_1781164089573.png';
const targets = [
  'assets/images/logo.png',
  'assets/images/icon.png',
  'assets/images/splash-icon.png',
  'assets/images/android-icon-foreground.png'
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download logo: status code ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded to ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log("Syncing logo from:", logoUrl);
  for (const target of targets) {
    const fullPath = path.resolve(__dirname, '..', target);
    try {
      // Ensure directory exists
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      await download(logoUrl, fullPath);
    } catch (err) {
      console.error(`Error downloading to ${target}:`, err);
    }
  }
}

run();
