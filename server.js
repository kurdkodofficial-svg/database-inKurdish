import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve static files from Vite build output
app.use(express.static(distPath));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Single Page Application (SPA) fallback
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="ku" dir="rtl">
        <head><meta charset="utf-8"><title>Building...</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
          <h2>فایلی dist/index.html نەدۆزرایەوە</h2>
          <p>تکایە دڵنیابە لە ڕێندەر (Render) لە بەشی Build Command نووسراوە: <code>npm run build</code></p>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Magic Platform] Server running on port ${PORT}`);
});
