const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HTML_FILE = path.join(__dirname, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.apk': 'application/vnd.android.package-archive',
};

const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Decode URL to handle spaces/special characters
  const decodedUrl = decodeURIComponent(req.url);

  // API Endpoints
  if (req.method === 'POST') {
    if (decodedUrl === '/api/settings') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const settings = JSON.parse(body);
          const assetsDir = path.join(__dirname, '..', 'assets');
          fs.mkdirSync(assetsDir, { recursive: true });
          const filePath = path.join(assetsDir, 'settings.json');

          fs.writeFile(filePath, JSON.stringify(settings, null, 2), (err) => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Failed to write settings file: ' + err.message }));
              return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          });
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON body: ' + err.message }));
        }
      });
      return;
    }

    if (decodedUrl === '/api/upload-logo') {
      const imagesDir = path.join(__dirname, '..', 'assets', 'images');
      fs.mkdirSync(imagesDir, { recursive: true });
      const filePath = path.join(imagesDir, 'logo.png');
      const fileStream = fs.createWriteStream(filePath);

      req.pipe(fileStream);

      fileStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: '/assets/images/logo.png' }));
      });

      fileStream.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save logo: ' + err.message }));
      });
      return;
    }

    if (decodedUrl === '/api/upload-font') {
      const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');
      fs.mkdirSync(fontsDir, { recursive: true });
      const filePath = path.join(fontsDir, 'Vazirmatn-Regular.ttf');
      const fileStream = fs.createWriteStream(filePath);

      req.pipe(fileStream);

      fileStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: '/assets/fonts/Vazirmatn-Regular.ttf' }));
      });

      fileStream.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save font file: ' + err.message }));
      });
      return;
    }

    if (decodedUrl === '/api/upload-apk') {
      const assetsDir = path.join(__dirname, '..', 'assets');
      fs.mkdirSync(assetsDir, { recursive: true });
      const filePath = path.join(assetsDir, 'kurd24-job.apk');
      const fileStream = fs.createWriteStream(filePath);

      req.pipe(fileStream);

      fileStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, url: '/assets/kurd24-job.apk' }));
      });

      fileStream.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save APK file: ' + err.message }));
      });
      return;
    }
  }

  // Route PWA manifest
  if (decodedUrl === '/manifest.json') {
    fs.readFile(path.join(__dirname, 'manifest.json'), (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Manifest Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(content);
      }
    });
    return;
  }

  // Route PWA Service Worker
  if (decodedUrl === '/sw.js') {
    fs.readFile(path.join(__dirname, 'sw.js'), (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Service Worker Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content);
      }
    });
    return;
  }

  // Route privacy policy
  if (decodedUrl === '/privacy.html' || decodedUrl === '/privacy') {
    fs.readFile(path.join(__dirname, 'privacy.html'), (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading privacy page: ' + err.message);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      }
    });
    return;
  }

  // Route root and index.html to serve PWA welcome landing page
  if (decodedUrl === '/' || decodedUrl === '/index.html') {
    fs.readFile(path.join(__dirname, 'landing.html'), (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading welcome page: ' + err.message);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(content);
      }
    });
    return;
  }

  // Route to secret admin portal path
  if (decodedUrl === '/admin-portal' || decodedUrl === '/admin-portal/' || decodedUrl === '/admin-portal/index.html') {
    fs.readFile(HTML_FILE, (err, content) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading admin portal page: ' + err.message);
      } else {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        });
        res.end(content);
      }
    });
    return;
  }

  // Serve static assets
  if (decodedUrl.startsWith('/assets/')) {
    const filePath = path.join(__dirname, '..', decodedUrl);
    
    // Simple path traversal check
    const relative = path.relative(path.join(__dirname, '..'), filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Kurd24 Job Admin Web Portal is running!`);
  console.log(`👉 Access URL: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});

