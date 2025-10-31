import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { convertPage } from './conversionMethods.js';

/**
 * Processes a single PDF page
 * @param {PDFDocument} pdfDoc - PDF document
 * @param {number} pageIndex - 0-indexed page number
 * @param {string} outputDir - Output directory
 * @param {number} dpi - DPI for conversion
 * @param {number} quality - JPEG quality
 * @returns {Promise<Object>} Page result object
 */
export async function processPage(pdfDoc, pageIndex, outputDir, dpi, quality) {
  const pageNum = pageIndex + 1;
  
  try {
    // Create a new document with just this page
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [pageIndex]);
    singlePageDoc.addPage(copiedPage);
    
    // Save the single page PDF
    const singlePagePdfBytes = await singlePageDoc.save();
    const singlePagePdfPath = path.join(outputDir, `page-${pageNum}.pdf`);
    fs.writeFileSync(singlePagePdfPath, singlePagePdfBytes);
    
    // Convert PDF to image
    const outputPath = path.join(outputDir, `page-${pageNum}.jpg`);
    await convertPage(
      singlePagePdfPath,
      outputDir,
      outputPath,
      pageNum,
      dpi,
      quality
    );
    
    // Get image dimensions
    const metadata = await sharp(outputPath).metadata();
    
    // Generate a thumbnail for preview
    const thumbnailPath = path.join(outputDir, `thumb-${pageNum}.jpg`);
    await sharp(outputPath)
      .resize({ height: 300, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    // Read thumbnail for base64 preview
    const thumbnailBuffer = fs.readFileSync(thumbnailPath);
    const base64Thumbnail = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
    
    // Clean up temporary files
    fs.unlinkSync(singlePagePdfPath);
    fs.unlinkSync(thumbnailPath);
    
    return {
      pageNumber: pageNum,
      dataUrl: base64Thumbnail,
      width: metadata.width,
      height: metadata.height,
      path: path.relative(path.dirname(outputDir), outputPath)
    };
  } catch (error) {
    console.error(`Error processing page ${pageNum}:`, error);
    return {
      pageNumber: pageNum,
      error: `Failed to process page: ${error.message}`
    };
  }
}

/**
 * Processes a batch of pages
 * @param {PDFDocument} pdfDoc - PDF document
 * @param {number} startIdx - Start index
 * @param {number} endIdx - End index
 * @param {string} outputDir - Output directory
 * @param {number} dpi - DPI for conversion
 * @param {number} quality - JPEG quality
 * @param {Array} resultsArray - Array to store results
 * @returns {Promise<void>}
 */
export async function processBatch(pdfDoc, startIdx, endIdx, outputDir, dpi, quality, resultsArray) {
  const pageCount = pdfDoc.getPageCount();
  
  for (let i = startIdx; i < endIdx && i < pageCount; i++) {
    const result = await processPage(pdfDoc, i, outputDir, dpi, quality);
    resultsArray[i] = result;
  }
}

/**
 * Processes all pages of a PDF with parallel processing
 * @param {string} pdfPath - Path to PDF file
 * @param {string} outputDir - Output directory
 * @param {number} dpi - DPI for conversion
 * @param {number} quality - JPEG quality
 * @param {number} parallelProcessing - Number of parallel workers
 * @returns {Promise<Array>} Array of page results
 */
export async function processPdfPages(pdfPath, outputDir, dpi, quality, parallelProcessing = 1) {
  // Load the PDF document
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();
  
  const pageResults = [];
  
  // Process pages based on parallel processing setting
  const batchSize = Math.ceil(pageCount / parallelProcessing);
  const batchPromises = [];
  
  for (let i = 0; i < parallelProcessing; i++) {
    const startIdx = i * batchSize;
    const endIdx = Math.min(startIdx + batchSize, pageCount);
    
    batchPromises.push(
      processBatch(pdfDoc, startIdx, endIdx, outputDir, dpi, quality, pageResults)
        .catch(err => {
          console.error(`Error in batch ${i} (pages ${startIdx + 1}-${endIdx}):`, err);
          return null;
        })
    );
  }
  
  await Promise.all(batchPromises);
  
  // Filter out undefined results and sort by page number
  return pageResults
    .filter(page => page !== undefined)
    .sort((a, b) => a.pageNumber - b.pageNumber);
}

/**
 * Validates that a file is a PDF
 * @param {string} filename - File name
 * @returns {boolean} True if file is a PDF
 */
export function isPdfFile(filename) {
  return filename.toLowerCase().endsWith('.pdf');
}

/**
 * Creates a safe filename for directory names
 * @param {string} filename - Original filename
 * @returns {string} Safe filename
 */
export function createSafeFilename(filename) {
  return path.basename(filename, '.pdf').replace(/[^a-zA-Z0-9]/g, '_');
}

