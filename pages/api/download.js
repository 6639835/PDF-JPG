import fs from 'fs';
import {
  jobExists,
  getJobSubdirectories,
  filterSubdirectories,
  getPageFile,
  createSingleZip,
  createFlatZip,
  generateDownloadFilename
} from '../../lib/downloadManager.js';

/**
 * Parses file indices from query parameters
 * @param {string|Array<string>} fileIndices - File indices
 * @returns {Array<number>|null} Parsed indices or null
 */
function parseFileIndices(fileIndices) {
  if (!fileIndices) {
    return null;
  }
  
  if (Array.isArray(fileIndices)) {
    return fileIndices.map(Number);
  }
  
  return [parseInt(fileIndices, 10)];
}

/**
 * Handles single page download
 * @param {Object} res - Response object
 * @param {string} jobId - Job ID
 * @param {Array<string>} targetDirs - Target directories
 * @param {string} pageName - Page name
 * @param {string} originalFilename - Original filename
 */
function handlePageDownload(res, jobId, targetDirs, pageName, originalFilename) {
  const pageFile = getPageFile(jobId, targetDirs[0], pageName);
  
  if (!pageFile) {
    return res.status(404).json({
      success: false,
      message: 'Page not found'
    });
  }
  
  const pageData = fs.readFileSync(pageFile.filePath);
  
  // Generate filename
  const fileName = originalFilename
    ? `${originalFilename}_${pageFile.fileName}`
    : `${targetDirs[0]}_${pageFile.fileName}`;
  
  // Set response headers for image download
  res.setHeader('Content-Type', 'image/jpeg');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Length', pageData.length);
  
  return res.status(200).send(pageData);
}

/**
 * Handles ZIP file download
 * @param {Object} res - Response object
 * @param {string} jobId - Job ID
 * @param {Array<string>} targetDirs - Target directories
 * @param {string} exportMethod - Export method
 */
async function handleZipDownload(res, jobId, targetDirs, exportMethod) {
  let zipBuffer;
  
  if (exportMethod === 'single-zip' || !exportMethod) {
    zipBuffer = await createSingleZip(jobId, targetDirs);
  } else {
    zipBuffer = await createFlatZip(jobId, targetDirs);
  }
  
  const filename = generateDownloadFilename();
  
  // Set response headers for file download
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', zipBuffer.length);
  
  return res.status(200).send(zipBuffer);
}

/**
 * Main API handler for file downloads
 */
export default async function handler(req, res) {
  // Support both GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get parameters from either query (GET) or body (POST)
    const params = req.method === 'GET' ? req.query : req.body;
    const { jobId, fileIndices, exportMethod, pageName, originalFilename } = params;
    
    // Validate jobId
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Missing jobId parameter'
      });
    }
    
    // Check if job exists
    if (!jobExists(jobId)) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or expired'
      });
    }
    
    // Get subdirectories
    const subdirs = getJobSubdirectories(jobId);
    const targetIndices = parseFileIndices(fileIndices);
    const targetDirs = filterSubdirectories(subdirs, targetIndices);
    
    if (targetDirs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No files found for the specified indices'
      });
    }

    // Handle single page download
    if (pageName) {
      return handlePageDownload(res, jobId, targetDirs, pageName, originalFilename);
    }
    
    // Handle ZIP download
    return await handleZipDownload(res, jobId, targetDirs, exportMethod);
    
  } catch (error) {
    console.error('Download error:', error);
    return res.status(500).json({
      success: false,
      message: `Download failed: ${error.message}`
    });
  }
}
