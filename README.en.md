# PDF to JPG High Resolution Converter

This is a web-based PDF to JPG conversion tool focused on maintaining the highest resolution and image quality.

## Latest Updates

- Updated to the latest PDF.js version (5.2.133) for better performance and compatibility
- Using ES modules to load PDF.js, aligning with modern web standards
- Improved interface responsiveness and conversion workflow

## Features

- Direct browser-based conversion with no server uploads required
- Support for up to 1200 DPI high-resolution output
- Adjustable JPEG compression quality up to 95%
- Support for multi-page PDF file conversion
- Options for individual downloads or batch ZIP packaging
- Clean, modern user interface
- Drag-and-drop file upload support

## Tech Stack

- Pure frontend implementation using HTML, CSS, and JavaScript
- PDF.js (5.2.133) for PDF rendering
- JSZip for multi-file package downloads
- Canvas API for image processing and export

## How to Use

1. Open the index.html file
2. Drag & drop PDF files to the designated area or click to browse files
3. Select the desired DPI (resolution) and JPG quality
4. Click the "Convert" button
5. After conversion, preview the generated images
6. Download individual pages or use the "Download All" button for a ZIP package

## Running Locally

Since this is a pure frontend project, you can open the index.html file directly in your browser. However, to avoid potential cross-origin issues, running a local server is recommended:

```bash
# Install dependencies (if you've downloaded the project and want to use the dependencies in package.json)
npm install

# Use the built-in Node.js server
node server.js

# Or use Python's simple HTTP server
python -m http.server

# Or use Node.js http-server (needs to be installed first)
npx http-server
```

## Troubleshooting

### PDF.js Library Loading Issues

If you encounter a "pdfjsLib is not defined" error, it could be due to:

1. **Network connectivity issues**: Ensure your network can access CDN resources
2. **Browser compatibility**: Make sure you're using a modern browser that supports ES modules (latest Chrome, Firefox, Safari, or Edge)
3. **Script loading order**: When running on a local server, ensure resources are loaded correctly

**Solutions**:

- Use the fallback.html (offline version) file, which includes references to local libraries
- Or download the PDF.js library (https://mozilla.github.io/pdf.js/getting_started/), place it in the project's libs directory, and update the references in index.html
- Ensure your server supports `.mjs` files with the MIME type `application/javascript`

### Memory Limitation Issues

Converting high-resolution multi-page PDFs can consume substantial memory. If you experience browser crashes or performance issues:

- Lower the DPI setting (use 300 or 600 DPI)
- Process large PDF files in smaller batches
- Use the latest browser versions, which typically have better memory management
- Select a lower value in the "Parallel Processing" setting to reduce memory usage

## Notes

- Large PDF files or high resolution settings may require longer processing times
- Memory usage during processing is proportional to PDF file size, page count, and selected DPI
- All conversions occur in the user's browser and are not uploaded to any server

## License

MIT

---

*[查看中文版](README.md)* 