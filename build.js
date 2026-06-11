const fs = require('fs');
const path = require('path');

// Ensure dist and dist/admin-portal exist
fs.mkdirSync('dist/admin-portal', { recursive: true });

// Helper to copy directory or file
function copy(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true, force: true });
  }
}

// Copy assets
copy('assets', 'dist/assets');

// Copy landing.html to dist/index.html
copy('admin-web/landing.html', 'dist/index.html');

// Copy privacy.html to dist/privacy.html
copy('admin-web/privacy.html', 'dist/privacy.html');

// Copy index.html to dist/admin-portal/index.html
copy('admin-web/index.html', 'dist/admin-portal/index.html');

// Copy manifest/sw/run files to dist/admin-portal/ and dist/
const files = ['manifest.json', 'sw.js', 'run.js'];
files.forEach(file => {
  copy(`admin-web/${file}`, `dist/admin-portal/${file}`);
  copy(`admin-web/${file}`, `dist/${file}`);
});

// Copy vercel.json to dist/vercel.json
copy('vercel.json', 'dist/vercel.json');

// Copy Vercel project settings to dist/.vercel/project.json for correct targeting
if (fs.existsSync('.vercel/project.json')) {
  fs.mkdirSync('dist/.vercel', { recursive: true });
  fs.copyFileSync('.vercel/project.json', 'dist/.vercel/project.json');
}

console.log('Build completed successfully.');
