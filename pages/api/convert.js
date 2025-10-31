// This is a placeholder for a server-side API endpoint that would handle PDF conversion
// In our application, we're doing the conversion client-side using PDF.js and Canvas API

import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { promisify } from 'util';
import { pipeline } from 'stream';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { spawn } from 'child_process';

// Try to import optional dependencies
let pdfPoppler;
try {
  pdfPoppler = require('pdf-poppler');
} catch (err) {
  console.log('pdf-poppler not available, will use alternative conversion methods');
}

let gm;
try {
  gm = require('gm');
} catch (err) {
  console.log('gm (GraphicsMagick) not available, will use alternative conversion methods');
}

// PDF.js fallback
let pdfjsLib;
let canvas;
try {
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
  const { createCanvas } = require('canvas');
  
  // Configure PDF.js worker
  const pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker.js');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
  
  canvas = createCanvas;
} catch (err) {
  console.log('PDF.js or Canvas not available:', err.message);
}

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const pump = promisify(pipeline);
const tempDir = path.join(os.tmpdir(), 'pdf-to-jpg-uploads');

// Ensure temp directory exists
function ensureTempDirs() {
  if (!fs.existsSync(tempDir)) {
    console.log('Creating main temp directory:', tempDir);
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Cleanup old temp directories if they exist and are older than 24 hours
  try {
    const currentTime = Date.now();
    const subdirs = fs.readdirSync(tempDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const dir of subdirs) {
      const dirPath = path.join(tempDir, dir);
      const stats = fs.statSync(dirPath);
      const dirAgeHours = (currentTime - stats.mtimeMs) / (1000 * 60 * 60);
      
      if (dirAgeHours > 24) {
        console.log(`Removing old temp directory (${Math.round(dirAgeHours)}h old):`, dirPath);
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    }
  } catch (error) {
    console.error('Error cleaning up old temp directories:', error);
  }
}

// Call this function at the beginning
ensureTempDirs();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a unique directory for this conversion job
    const jobId = uuidv4();
    const jobDir = path.join(tempDir, jobId);
    fs.mkdirSync(jobDir, { recursive: true });

    // Parse the incoming form data
    const form = new IncomingForm({
      uploadDir: jobDir,
      keepExtensions: true,
      multiples: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB max file size
    });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parsing error:', err);
          return reject(err);
        }
        resolve({ fields, files });
      });
    });

    // Get conversion settings
    const dpi = parseInt(fields.dpi?.[0] || '300');
    const quality = parseInt(fields.quality?.[0] || '95');
    const parallelProcessing = parseInt(fields.parallelProcessing?.[0] || '1');

    // Process each uploaded PDF file
    const results = [];
    const pdfFiles = Array.isArray(files.pdfFiles) ? files.pdfFiles : [files.pdfFiles];

    if (!pdfFiles || pdfFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No PDF files were uploaded'
      });
    }

    for (const file of pdfFiles) {
      if (!file || !file.filepath) continue;
      
      const pdfPath = file.filepath;
      const pdfFilename = file.originalFilename || path.basename(pdfPath);
      
      // Verify this is actually a PDF file
      if (!pdfFilename.toLowerCase().endsWith('.pdf')) {
        results.push({
          filename: pdfFilename,
          error: 'Not a PDF file',
          pages: []
        });
        continue;
      }
      
      // Create output directory for this file
      const safeFilename = path.basename(pdfFilename, '.pdf').replace(/[^a-zA-Z0-9]/g, '_');
      const outputDir = path.join(jobDir, safeFilename);
      fs.mkdirSync(outputDir, { recursive: true });
      
      try {
        // Load the PDF document
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();
        
        // Process each page
        const pageResults = [];
        
        // Calculate scale factor based on DPI (PDF default is 72 DPI)
        const scaleFactor = dpi / 72;
        
        // Process pages based on parallel processing setting
        const processBatch = async (startIdx, endIdx) => {
          for (let i = startIdx; i < endIdx && i < pageCount; i++) {
            try {
              // Create a new document with just this page
              const singlePageDoc = await PDFDocument.create();
              const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
              singlePageDoc.addPage(copiedPage);
              
              // Save the single page PDF
              const singlePagePdfBytes = await singlePageDoc.save();
              const singlePagePdfPath = path.join(outputDir, `page-${i+1}.pdf`);
              fs.writeFileSync(singlePagePdfPath, singlePagePdfBytes);
              
              // Convert PDF to image using sharp with the correct DPI
              const outputPath = path.join(outputDir, `page-${i+1}.jpg`);
              
              // Use sharp to convert PDF to image - with fallback mechanism
              try {
                // First attempt with sharp's native PDF support
                await sharp(singlePagePdfPath, { density: dpi })
                  .jpeg({ quality: quality })
                  .toFile(outputPath);
              } catch (sharpError) {
                console.error(`Sharp conversion error for page ${i+1}, trying alternative method:`, sharpError);
                
                // Try different fallback methods in sequence
                let converted = false;
                
                // 1. Try pdf-poppler if available
                if (pdfPoppler && !converted) {
                  try {
                    console.log(`Trying pdf-poppler for page ${i+1}`);
                    const popplerOptions = {
                      format: 'jpeg',
                      out_dir: outputDir,
                      out_prefix: `page-${i+1}`,
                      page: i+1,
                      jpeg_quality: quality
                    };
                    
                    if (dpi) {
                      popplerOptions.dpi = dpi;
                    }
                    
                    await pdfPoppler.convert(singlePagePdfPath, popplerOptions);
                    
                    // Check if the file was created with the expected name format
                    const popplerOutputPath = path.join(outputDir, `page-${i+1}-1.jpg`);
                    if (fs.existsSync(popplerOutputPath)) {
                      // Rename to match our expected format
                      fs.renameSync(popplerOutputPath, outputPath);
                      converted = true;
                    }
                  } catch (popplerError) {
                    console.error(`pdf-poppler conversion failed for page ${i+1}:`, popplerError);
                  }
                }
                
                // 2. Try Ghostscript if available and poppler failed
                if (!converted) {
                  try {
                    console.log(`Trying Ghostscript for page ${i+1}`);
                    // Try to detect if Ghostscript is installed
                    const gs = spawn('gs', ['--version']);
                    let gsInstalled = false;
                    
                    await new Promise((resolve) => {
                      gs.on('error', () => {
                        gsInstalled = false;
                        resolve();
                      });
                      
                      gs.on('close', (code) => {
                        gsInstalled = code === 0;
                        resolve();
                      });
                    });
                    
                    if (gsInstalled) {
                      // Use Ghostscript to convert PDF to JPEG
                      const gsProcess = spawn('gs', [
                        '-sDEVICE=jpeg',
                        `-r${dpi}`,
                        `-dJPEGQ=${quality}`,
                        '-dNOPAUSE',
                        '-dBATCH',
                        `-sOutputFile=${outputPath}`,
                        singlePagePdfPath
                      ]);
                      
                      await new Promise((resolve, reject) => {
                        gsProcess.on('error', reject);
                        gsProcess.on('close', (code) => {
                          if (code === 0) {
                            converted = true;
                            resolve();
                          } else {
                            reject(new Error(`Ghostscript exited with code ${code}`));
                          }
                        });
                      });
                    }
                  } catch (gsError) {
                    console.error(`Ghostscript conversion failed for page ${i+1}:`, gsError);
                  }
                }
                
                // 3. Try a simpler approach with sharp if other methods failed
                if (!converted) {
                  try {
                    console.log(`Trying two-step Sharp conversion for page ${i+1}`);
                    // First convert PDF to PNG with lower density (usually more compatible)
                    const tempPngPath = path.join(outputDir, `temp-${i+1}.png`);
                    await sharp(singlePagePdfPath, { density: Math.min(dpi, 300) })
                      .png()
                      .toFile(tempPngPath);
                    
                    // Then convert PNG to JPEG with desired quality
                    await sharp(tempPngPath)
                      .jpeg({ quality: quality })
                      .toFile(outputPath);
                    
                    // Remove temporary PNG
                    fs.unlinkSync(tempPngPath);
                    converted = true;
                  } catch (sharpFallbackError) {
                    console.error(`Two-step Sharp conversion also failed for page ${i+1}:`, sharpFallbackError);
                  }
                }
                
                // 4. Try GM (GraphicsMagick) if available
                if (!converted && gm) {
                  try {
                    console.log(`Trying GraphicsMagick for page ${i+1}`);
                    await new Promise((resolve, reject) => {
                      gm(singlePagePdfPath)
                        .density(dpi, dpi)
                        .quality(quality)
                        .setFormat('jpg')
                        .write(outputPath, (err) => {
                          if (err) reject(err);
                          else {
                            converted = true;
                            resolve();
                          }
                        });
                    });
                  } catch (gmError) {
                    console.error(`GraphicsMagick conversion failed for page ${i+1}:`, gmError);
                  }
                }
                
                // 5. Last resort: Use PDF.js with Canvas renderer
                if (!converted && pdfjsLib && canvas) {
                  try {
                    console.log(`Trying PDF.js renderer for page ${i+1}`);
                    
                    // Load PDF with PDF.js
                    const pdfData = new Uint8Array(fs.readFileSync(singlePagePdfPath));
                    const pdfDoc = await pdfjsLib.getDocument({data: pdfData}).promise;
                    const pdfPage = await pdfDoc.getPage(1); // Page numbers are 1-based in PDF.js
                    
                    // Calculate dimensions based on DPI
                    const viewport = pdfPage.getViewport({scale: dpi / 72}); // PDF default is 72 DPI
                    
                    // Create canvas with the right dimensions
                    const canvasObj = canvas(viewport.width, viewport.height);
                    const context = canvasObj.getContext('2d');
                    
                    // Render PDF page to canvas
                    await pdfPage.render({
                      canvasContext: context,
                      viewport: viewport
                    }).promise;
                    
                    // Convert canvas to JPEG and save
                    const jpegData = canvasObj.toBuffer('image/jpeg', {quality: quality / 100});
                    fs.writeFileSync(outputPath, jpegData);
                    
                    converted = true;
                  } catch (pdfjsError) {
                    console.error(`PDF.js conversion failed for page ${i+1}:`, pdfjsError);
                  }
                }
                
                // If all methods failed, throw an error
                if (!converted) {
                  throw new Error(`All conversion methods failed for page ${i+1}`);
                }
              }
              
              // Get image dimensions
              const metadata = await sharp(outputPath).metadata();
              
              // Generate a thumbnail for preview (limited to 300px height)
              const thumbnailPath = path.join(outputDir, `thumb-${i+1}.jpg`);
              await sharp(outputPath)
                .resize({ height: 300, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
              
              // Read thumbnail for base64 preview
              const thumbnailBuffer = fs.readFileSync(thumbnailPath);
              const base64Thumbnail = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
              
              pageResults[i] = {
                pageNumber: i + 1,
                dataUrl: base64Thumbnail,
                width: metadata.width,
                height: metadata.height,
                path: path.relative(jobDir, outputPath)
              };
              
              // Clean up single page PDF and thumbnail
              fs.unlinkSync(singlePagePdfPath);
              fs.unlinkSync(thumbnailPath);
            } catch (error) {
              console.error(`Error processing page ${i+1} of ${pdfFilename}:`, error);
              pageResults[i] = {
                pageNumber: i + 1,
                error: `Failed to process page: ${error.message}`
              };
            }
          }
        };
        
        // Process pages in parallel based on setting
        const batchSize = Math.ceil(pageCount / parallelProcessing);
        const batchPromises = [];
        
        for (let i = 0; i < parallelProcessing; i++) {
          const startIdx = i * batchSize;
          const endIdx = Math.min(startIdx + batchSize, pageCount);
          batchPromises.push(processBatch(startIdx, endIdx).catch(err => {
            console.error(`Error in batch ${i} (pages ${startIdx+1}-${endIdx}):`, err);
            // Return partial results for this batch instead of failing completely
            return null;
          }));
        }
        
        await Promise.all(batchPromises);
        
        // Check if all pages failed
        const validResults = pageResults.filter(page => page !== undefined);
        if (validResults.length === 0) {
          throw new Error(`Failed to process PDF "${pdfFilename}". No pages could be converted.`);
        }
        
        // Filter out any undefined results and sort by page number
        const validPageResults = pageResults
          .filter(page => page !== undefined)
          .sort((a, b) => a.pageNumber - b.pageNumber);
        
        results.push({
          filename: pdfFilename,
          originalFilename: pdfFilename,
          safeFolderName: safeFilename,
          pages: validPageResults,
          totalPages: pageCount,
          jobId: jobId
        });
      } catch (error) {
        console.error(`Error processing PDF ${pdfFilename}:`, error);
        results.push({
          filename: pdfFilename,
          error: `Failed to process PDF: ${error.message}`,
          pages: []
        });
      }
    }

    res.status(200).json({ 
      success: true,
      results: results,
      jobId: jobId
    });
    
    // Schedule cleanup of temp files (after 1 hour)
    setTimeout(() => {
      try {
        console.log(`Cleaning up temporary files for job ${jobId}...`);
        fs.rmSync(jobDir, { recursive: true, force: true });
        console.log(`Cleanup completed for job ${jobId}`);
      } catch (e) {
        console.error(`Error cleaning up temp files for job ${jobId}:`, e);
      }
    }, 3600000); 
    
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