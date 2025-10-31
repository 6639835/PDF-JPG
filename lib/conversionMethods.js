import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    console.log(`Converting page ${pageNum} with DPI=${dpi}, quality=${quality}`);
    
    // Use pdftoppm directly instead of pdf-poppler library
    // Format: pdftoppm -jpeg -r <dpi> -f <page> -l <page> -jpegopt quality=<quality> input.pdf output_prefix
    const outputPrefix = path.join(outputDir, `page-${pageNum}`);
    
    // Build the pdftoppm command
    // Note: pdfPath is a single-page PDF, so we always extract page 1
    const command = `pdftoppm -jpeg -r ${dpi} -f 1 -l 1 -jpegopt quality=${quality} "${pdfPath}" "${outputPrefix}"`;
    
    console.log(`Executing: ${command}`);
    
    try {
      // Execute pdftoppm with timeout
      const { stdout, stderr } = await execAsync(command, { 
        timeout: 120000, // 120 second timeout
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large images
      });
      
      if (stderr) {
        console.log(`pdftoppm stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(`pdftoppm stdout: ${stdout}`);
      }
      
      console.log(`✓ pdftoppm conversion complete for page ${pageNum}`);
    } catch (convError) {
      console.error(`pdftoppm conversion error for page ${pageNum}:`, convError);
      throw convError;
    }
    
    // pdftoppm creates files with format: {prefix}-{page}.jpg (page is zero-padded)
    // For single page PDFs, it creates: prefix-1.jpg
    const expectedOutputPath = `${outputPrefix}-1.jpg`;
    console.log(`Looking for output file: ${expectedOutputPath}`);
    
    // Check what files were actually created
    const files = fs.readdirSync(outputDir);
    console.log(`Files in output directory: ${files.join(', ')}`);
    
    // Verify the output file was created
    if (!fs.existsSync(expectedOutputPath)) {
      throw new Error(`pdftoppm did not create expected output file: ${expectedOutputPath}. Available files: ${files.join(', ')}`);
    }
    
    // Rename to our expected format
    fs.renameSync(expectedOutputPath, outputPath);
    
    console.log(`✓ Converted page ${pageNum} successfully to ${path.basename(outputPath)}`);
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

