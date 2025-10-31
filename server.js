/**
 * Custom Next.js Server
 * 
 * This custom server is used to:
 * 1. Increase API timeout for large PDF file processing
 * 2. Handle long-running conversion operations
 * 
 * For standard Next.js apps, you can use `next start` directly.
 * This server is only needed if you want custom timeout configurations.
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Create the Next.js app instance
const app = next({ dev, hostname });
const handle = app.getRequestHandler();

// Start the server
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Set higher timeout for API routes that handle file processing
      if (req.url.startsWith('/api/')) {
        // Increase timeout for API routes (10 minutes for large files)
        req.setTimeout(10 * 60 * 1000);
        res.setTimeout(10 * 60 * 1000);
      }
      
      // Set larger body size limits for uploads
      // Note: This doesn't actually affect the request size limit
      // Use the config in next.config.js and formidable options for that
      
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> PDF to JPG Converter is running');
    console.log('> Press Ctrl+C to stop the server');
  });
}); 