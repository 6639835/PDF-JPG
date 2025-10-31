# PDF to JPG High Resolution Converter

A premium, high-quality PDF to JPG conversion tool with a sophisticated, gallery-like design and powerful server-side processing.

## Features

- **High Quality Conversion**: Support for up to 1200 DPI with adjustable JPEG quality (75%, 85%, 95%)
- **Server-Side Processing**: Robust conversion using pdf-poppler (industry-standard Poppler library)
- **Multi-Page Support**: Process all pages in PDF documents simultaneously
- **Parallel Processing**: Optimized conversion with adjustable parallel processing (1, 2, or 4 workers)
- **Flexible Downloads**: Options for individual JPGs or organized ZIP packages
- **Modern Design**: Premium, gallery-like experience with sophisticated animations powered by Framer Motion
- **Professional UI**: Built with Next.js, React, and Tailwind CSS

## Design Highlights

- **Premium Color Scheme**: Deep black background with gold and teal accents
- **Typography**: Elegant Inter font with custom features and thoughtful spacing
- **Animation System**: Smooth, natural animations with Framer Motion
- **Glass Morphism**: Modern glass effects for UI components
- **Responsive Design**: Mobile-first approach with adaptive layouts

## Technology Stack

- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom configuration
- **Animations**: Framer Motion for smooth UI transitions
- **PDF Processing**: pdf-poppler (based on the industry-standard Poppler library)
- **Image Processing**: Sharp for thumbnail generation and optimization
- **File Handling**: JSZip for packaging, Formidable for uploads

## Prerequisites

### Required

- **Node.js**: Version 16 or higher
- **npm** or **yarn**: For package management
- **Poppler**: Required for PDF to image conversion
  - macOS: `brew install poppler`
  - Ubuntu/Debian: `sudo apt-get install poppler-utils`
  - Windows: Download from [poppler-windows releases](https://github.com/oschwartz10612/poppler-windows/releases/)

> **Note**: Poppler is the industry-standard PDF rendering library used by many applications. The `pdf-poppler` npm package requires the poppler-utils command-line tools to be installed on your system.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PDF-JPG
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Install Poppler (required):
   ```bash
   # macOS
   brew install poppler
   
   # Ubuntu/Debian
   sudo apt-get install poppler-utils
   
   # Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases/
   ```

## Running Locally

### Development Mode

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

Build the application:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm start
# or
yarn start
```

## Project Structure

```
PDF-JPG/
├── components/          # React components
│   ├── Features.js      # Feature showcase
│   ├── FileUploader.js  # File upload component
│   ├── Footer.js        # Footer component
│   ├── Header.js        # Navigation header
│   ├── Hero.js          # Hero section
│   ├── ProgressIndicator.js  # Conversion progress
│   ├── ResultsGallery.js     # Results display
│   └── SettingsPanel.js      # Settings configuration
├── lib/                 # Utility libraries
│   ├── conversionMethods.js  # PDF conversion implementations
│   ├── downloadManager.js    # Download handling
│   ├── pdfProcessor.js       # PDF processing logic
│   └── tempFileManager.js    # Temporary file management
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   │   ├── convert.js   # Conversion endpoint
│   │   └── download.js  # Download endpoint
│   ├── _app.js          # App wrapper
│   ├── _document.js     # Document structure
│   └── index.js         # Main page
├── public/              # Static assets
│   ├── favicon.ico
│   └── upload-icon.svg
├── styles/              # Stylesheets
│   └── globals.css      # Global styles with Tailwind
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## API Endpoints

### POST /api/convert

Converts PDF files to JPG images.

**Request Body** (multipart/form-data):
- `pdfFiles`: PDF file(s) to convert (max 50MB each)
- `dpi`: Resolution (300, 600, or 1200)
- `quality`: JPEG quality (75, 85, or 95)
- `parallelProcessing`: Number of parallel workers (1, 2, or 4)

**Response**:
```json
{
  "success": true,
  "jobId": "unique-job-id",
  "results": [
    {
      "filename": "example.pdf",
      "pages": [
        {
          "pageNumber": 1,
          "dataUrl": "data:image/jpeg;base64,...",
          "width": 2400,
          "height": 3000
        }
      ]
    }
  ]
}
```

### GET /api/download

Downloads converted files.

**Query Parameters**:
- `jobId`: Job identifier (required)
- `fileIndices`: Specific file indices to download (optional)
- `exportMethod`: Export format - `single-zip`, `multiple-zip`, or `no-zip`
- `pageName`: Specific page to download (optional)

## Configuration

### DPI Settings

- **300 DPI**: Standard quality, smaller file sizes
- **600 DPI**: High quality, balanced file sizes
- **1200 DPI**: Ultra high quality, larger file sizes

### Quality Settings

- **75%**: Standard compression, smaller files
- **85%**: High quality, balanced compression
- **95%**: Ultra high quality, minimal compression

### Export Methods

- **Single ZIP**: All PDFs in one ZIP with separate folders
- **Multiple ZIPs**: Each PDF in its own ZIP file
- **No ZIP**: Download all JPG files individually

## Conversion Method

The application uses **pdf-poppler** for PDF to image conversion:

- **pdf-poppler**: Based on Poppler, the industry-standard PDF rendering library
  - High-quality, reliable PDF rendering
  - Excellent support for various PDF features
  - Fast and efficient conversion
  - Widely used and well-maintained

This single, powerful conversion method ensures consistent, high-quality results without the complexity of multiple fallback systems.

## Troubleshooting

### "PDF conversion failed" or "poppler-utils not found"

This error means Poppler is not installed on your system. To fix:

**macOS:**
```bash
brew install poppler
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install poppler-utils
```

**Windows:**
1. Download the latest release from [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases/)
2. Extract to a directory (e.g., `C:\Program Files\poppler`)
3. Add the `bin` folder to your system PATH

To verify installation, run:
```bash
pdftoppm -v
```

### Large file conversion fails

- Increase the `maxFileSize` in `pages/api/convert.js`
- Adjust server timeout in `server.js`
- Use lower DPI settings for very large files

### Out of memory errors

- Reduce parallel processing from 4 to 2 or 1
- Lower the DPI setting
- Process fewer files at once

## Development

### Adding New Features

The codebase is organized into modular components:

- **API Routes** (`pages/api/`): Handle server-side logic
- **Components** (`components/`): Reusable UI components
- **Libraries** (`lib/`): Utility functions and business logic

### Code Style

- Use ES6+ JavaScript features
- Follow React hooks patterns
- Maintain consistent Tailwind CSS usage
- Document complex functions with JSDoc comments

### Testing

Before deploying:

1. Test with various PDF files (small, large, multi-page)
2. Test all DPI settings
3. Test all export methods
4. Test on different browsers
5. Test error handling

## Performance Optimization

- Temporary files are automatically cleaned up after 1 hour
- Old job directories (>24 hours) are cleaned on server start
- Thumbnails are generated at 300px height for fast preview
- Parallel processing can be adjusted based on server capacity

## Security Considerations

- File size limits prevent abuse (50MB per file)
- Temporary files are isolated per job
- Automatic cleanup prevents disk space issues
- File validation checks PDF magic numbers

## License

MIT

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review existing GitHub issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, React, and modern web technologies.
