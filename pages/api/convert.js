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
  return {
    dpi: parseInt(fields.dpi?.[0] || '300'),
    quality: parseInt(fields.quality?.[0] || '95'),
    parallelProcessing: parseInt(fields.parallelProcessing?.[0] || '1'),
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
    return null;
  }

  const pdfPath = file.filepath;
  const pdfFilename = file.originalFilename || path.basename(pdfPath);

  // Verify this is a PDF file
  if (!isPdfFile(pdfFilename)) {
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

  try {
    const pageResults = await processPdfPages(
      pdfPath,
      outputDir,
      settings.dpi,
      settings.quality,
      settings.parallelProcessing
    );

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

  try {
    // Create a unique directory for this conversion job
    const jobId = uuidv4();
    const jobDir = createJobDirectory(jobId);

    // Parse the incoming form data
    const { fields, files } = await parseFormData(req, jobDir);

    // Get conversion settings
    const settings = extractSettings(fields);

    // Process each uploaded PDF file
    const results = [];
    const pdfFiles = Array.isArray(files.pdfFiles) ? files.pdfFiles : [files.pdfFiles];

    if (!pdfFiles || pdfFiles.length === 0 || !pdfFiles[0]) {
      return res.status(400).json({
        success: false,
        message: 'No PDF files were uploaded'
      });
    }

    for (const file of pdfFiles) {
      const result = await processFile(file, jobDir, jobId, settings);
      if (result) {
        results.push(result);
      }
    }

    // Return success response
    res.status(200).json({
      success: true,
      results: results,
      jobId: jobId
    });

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
