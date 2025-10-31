import fs from 'fs';
import path from 'path';
import pdfPoppler from 'pdf-poppler';

/**
 * Converts a single PDF page to JPG using pdf-poppler
 * This is the only conversion method - pdf-poppler is based on the industry-standard
 * Poppler library and provides reliable, high-quality PDF to image conversion.
 * 
 * @param {string} pdfPath - Path to the PDF file
 * @param {string} outputDir - Output directory
 * @param {string} outputPath - Final output path for the JPG
 * @param {number} pageNum - Page number (1-indexed)
 * @param {number} dpi - DPI for the output image (default: 300)
 * @param {number} quality - JPEG quality (0-100, default: 95)
 * @returns {Promise<void>} Resolves when conversion is complete
 * @throws {Error} If conversion fails
 */
export async function convertPage(pdfPath, outputDir, outputPath, pageNum, dpi = 300, quality = 95) {
  try {
    // Configure pdf-poppler options
    const popplerOptions = {
      format: 'jpeg',
      out_dir: outputDir,
      out_prefix: `page-${pageNum}`,
      page: pageNum,
      scale: dpi,  // pdf-poppler uses scale parameter for resolution
      jpeg_quality: quality
    };
    
    // Convert the PDF page
    await pdfPoppler.convert(pdfPath, popplerOptions);
    
    // pdf-poppler creates files with format: {prefix}-{page}.jpg
    const popplerOutputPath = path.join(outputDir, `page-${pageNum}-1.jpg`);
    
    // Verify the output file was created
    if (!fs.existsSync(popplerOutputPath)) {
      throw new Error(`pdf-poppler did not create expected output file: ${popplerOutputPath}`);
    }
    
    // Rename to our expected format
    fs.renameSync(popplerOutputPath, outputPath);
    
    console.log(`✓ Converted page ${pageNum} successfully`);
  } catch (error) {
    console.error(`✗ Failed to convert page ${pageNum}:`, error.message);
    throw new Error(
      `PDF conversion failed. Please ensure poppler-utils is installed.\n` +
      `macOS: brew install poppler\n` +
      `Ubuntu/Debian: sudo apt-get install poppler-utils\n` +
      `Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases/\n` +
      `Error details: ${error.message}`
    );
  }
}

