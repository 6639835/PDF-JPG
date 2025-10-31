import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import os from 'os';

// Get the temporary directory for PDF-to-JPG conversions
const tempDir = path.join(os.tmpdir(), 'pdf-to-jpg-uploads');

export default async function handler(req, res) {
  // Support both GET and POST methods
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get parameters from either query (GET) or body (POST)
    const params = req.method === 'GET' ? req.query : req.body;
    const { jobId, fileIndices, exportMethod, pageName } = params;
    
    if (!jobId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing jobId parameter' 
      });
    }
    
    // Check if job directory exists
    const jobDir = path.join(tempDir, jobId);
    if (!fs.existsSync(jobDir)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or expired' 
      });
    }
    
    // Get subdirectories (one per PDF)
    const subdirs = fs.readdirSync(jobDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Parse fileIndices (could be a string from query parameters)
    let targetIndices = null;
    if (fileIndices) {
      targetIndices = Array.isArray(fileIndices) 
        ? fileIndices.map(Number) 
        : [parseInt(fileIndices, 10)];
    }
    
    // Filter subdirectories if specific fileIndices are provided
    const targetDirs = targetIndices 
      ? subdirs.filter((_, index) => targetIndices.includes(index)) 
      : subdirs;
    
    if (targetDirs.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No files found for the specified indices' 
      });
    }

    // If a specific page is requested, return just that page
    if (pageName) {
      const dirIndex = targetIndices ? targetIndices[0] : 0;
      const pdfDir = path.join(jobDir, targetDirs[0]);
      
      // Find the specific page file
      const pageFiles = fs.readdirSync(pdfDir)
        .filter(file => file.toLowerCase().startsWith(pageName.toLowerCase()) && file.endsWith('.jpg'));
      
      if (pageFiles.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Page not found'
        });
      }
      
      // Return the first matching page
      const pagePath = path.join(pdfDir, pageFiles[0]);
      const pageData = fs.readFileSync(pagePath);
      
      // Use the original folder name as part of the filename if available
      // This helps maintain the original filename with spaces instead of the safe version
      const fileName = req.query.originalFilename 
        ? `${req.query.originalFilename}_${pageFiles[0]}` 
        : `${targetDirs[0]}_${pageFiles[0]}`;
      
      // Set response headers for image download
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', pageData.length);
      
      // Send the image file
      return res.status(200).send(pageData);
    }
    
    // Create a new ZIP file
    const zip = new JSZip();
    
    // Add files to the ZIP based on export method
    if (exportMethod === 'single-zip' || !exportMethod) {
      // Add each PDF's images to a separate folder in the ZIP
      for (const dir of targetDirs) {
        const pdfDir = path.join(jobDir, dir);
        const files = fs.readdirSync(pdfDir)
          .filter(file => file.endsWith('.jpg'));
        
        // Add each image to the ZIP
        for (const file of files) {
          const filePath = path.join(pdfDir, file);
          const fileData = fs.readFileSync(filePath);
          zip.folder(dir).file(file, fileData);
        }
      }
    } else {
      // Add all images directly to the root of the ZIP
      for (const dir of targetDirs) {
        const pdfDir = path.join(jobDir, dir);
        const files = fs.readdirSync(pdfDir)
          .filter(file => file.endsWith('.jpg'));
        
        // Add each image to the ZIP with a prefix
        for (const file of files) {
          const filePath = path.join(pdfDir, file);
          const fileData = fs.readFileSync(filePath);
          zip.file(`${dir}_${file}`, fileData);
        }
      }
    }
    
    // Generate the ZIP file
    const zipBuffer = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="pdf-to-jpg-${new Date().toISOString().slice(0, 10)}.zip"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    // Send the ZIP file
    res.status(200).send(zipBuffer);
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false, 
      message: `Download failed: ${error.message}` 
    });
  }
} 