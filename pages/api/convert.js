import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createJobDirectory, scheduleCleanup } from '../../lib/tempFileManager.js';
import { processPdfPages, isPdfFile, createSafeFilename } from '../../lib/pdfProcessor.js';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parses the incoming form data
 * @param {Object} req - Request object
 * @param {string} jobDir - Job directory path
 * @returns {Promise<Object>} Parsed fields and files
 */
async function parseFormData(req, jobDir) {
  const form = new IncomingForm({
    uploadDir: jobDir,
    keepExtensions: true,
    multiples: true,
    maxFileSize: 50 * 1024 * 1024, // 50MB max file size
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
}

/**
 * Extracts settings from form fields
 * @param {Object} fields - Form fields
 * @returns {Object} Settings object
 */
function extractSettings(fields) {
  // formidable v3 returns fields as arrays
  const dpiValue = Array.isArray(fields.dpi) ? fields.dpi[0] : fields.dpi || '300';
  const qualityValue = Array.isArray(fields.quality) ? fields.quality[0] : fields.quality || '95';
  const parallelValue = Array.isArray(fields.parallelProcessing) ? fields.parallelProcessing[0] : fields.parallelProcessing || '1';
  
  console.log('Raw field values:', { dpiValue, qualityValue, parallelValue });
  
  return {
    dpi: parseInt(dpiValue, 10),
    quality: parseInt(qualityValue, 10),
    parallelProcessing: parseInt(parallelValue, 10),
  };
}

/**
 * Processes a single PDF file
 * @param {Object} file - File object from formidable
 * @param {string} jobDir - Job directory path
 * @param {string} jobId - Job ID
 * @param {Object} settings - Conversion settings
 * @returns {Promise<Object>} Processing result
 */
async function processFile(file, jobDir, jobId, settings) {
  if (!file || !file.filepath) {
    console.log('No file or filepath provided');
    return null;
  }

  const pdfPath = file.filepath;
  const pdfFilename = file.originalFilename || path.basename(pdfPath);
  console.log(`Processing: ${pdfFilename} at ${pdfPath}`);

  // Verify this is a PDF file
  if (!isPdfFile(pdfFilename)) {
    console.log(`Not a PDF file: ${pdfFilename}`);
    return {
      filename: pdfFilename,
      error: 'Not a PDF file',
      pages: []
    };
  }

  // Create output directory for this file
  const safeFilename = createSafeFilename(pdfFilename);
  const outputDir = path.join(jobDir, safeFilename);
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Output directory created: ${outputDir}`);

  try {
    console.log(`Starting PDF processing with settings:`, settings);
    const pageResults = await processPdfPages(
      pdfPath,
      outputDir,
      settings.dpi,
      settings.quality,
      settings.parallelProcessing
    );
    console.log(`PDF processing complete. Pages processed: ${pageResults.length}`);

    // Check if all pages failed
    const validResults = pageResults.filter(page => !page.error);
    if (validResults.length === 0) {
      throw new Error(`Failed to process PDF "${pdfFilename}". No pages could be converted.`);
    }

    return {
      filename: pdfFilename,
      originalFilename: pdfFilename,
      safeFolderName: safeFilename,
      pages: pageResults,
      totalPages: pageResults.length,
      jobId: jobId
    };
  } catch (error) {
    console.error(`Error processing PDF ${pdfFilename}:`, error);
    return {
      filename: pdfFilename,
      error: `Failed to process PDF: ${error.message}`,
      pages: []
    };
  }
}

/**
 * Main API handler for PDF to JPG conversion
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('=== Conversion API called ===');
  
  try {
    // Create a unique directory for this conversion job
    const jobId = uuidv4();
    const jobDir = createJobDirectory(jobId);
    console.log('Job directory created:', jobDir);

    // Parse the incoming form data
    console.log('Starting form data parsing...');
    const { fields, files } = await parseFormData(req, jobDir);
    console.log('Form data parsed. Files:', Object.keys(files), 'Fields:', Object.keys(fields));

    // Get conversion settings
    const settings = extractSettings(fields);
    console.log('Settings:', settings);

    // Process each uploaded PDF file
    const results = [];
    const pdfFiles = Array.isArray(files.pdfFiles) ? files.pdfFiles : [files.pdfFiles];

    if (!pdfFiles || pdfFiles.length === 0 || !pdfFiles[0]) {
      console.log('No PDF files received');
      return res.status(400).json({
        success: false,
        message: 'No PDF files were uploaded'
      });
    }

    console.log(`Processing ${pdfFiles.length} PDF file(s)...`);
    for (const file of pdfFiles) {
      console.log(`Processing file: ${file?.originalFilename || 'unknown'}`);
      const result = await processFile(file, jobDir, jobId, settings);
      if (result) {
        results.push(result);
        console.log(`File processed: ${result.filename}, pages: ${result.totalPages}`);
      }
    }

    // Return success response
    console.log('Conversion complete. Sending response...');
    res.status(200).json({
      success: true,
      results: results,
      jobId: jobId
    });
    console.log('Response sent successfully');

    // Schedule cleanup of temp files (after 1 hour)
    scheduleCleanup(jobDir, jobId);

  } catch (error) {
    console.error('Conversion error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });

    res.status(500).json({
      success: false,
      message: `Conversion failed: ${error.message}`,
      errorDetails: process.env.NODE_ENV !== 'production' ? {
        name: error.name,
        stack: error.stack,
        code: error.code
      } : undefined
    });
  }
}
