import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { getTempDir } from './tempFileManager.js';

/**
 * Gets the job directory path
 * @param {string} jobId - Job ID
 * @returns {string} Job directory path
 */
export function getJobDirectory(jobId) {
  return path.join(getTempDir(), jobId);
}

/**
 * Checks if a job directory exists
 * @param {string} jobId - Job ID
 * @returns {boolean} True if job exists
 */
export function jobExists(jobId) {
  const jobDir = getJobDirectory(jobId);
  return fs.existsSync(jobDir);
}

/**
 * Gets subdirectories in a job directory
 * @param {string} jobId - Job ID
 * @returns {Array<string>} Array of subdirectory names
 */
export function getJobSubdirectories(jobId) {
  const jobDir = getJobDirectory(jobId);
  return fs.readdirSync(jobDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

/**
 * Filters subdirectories based on file indices
 * @param {Array<string>} subdirs - All subdirectories
 * @param {Array<number>|null} fileIndices - File indices to include
 * @returns {Array<string>} Filtered subdirectories
 */
export function filterSubdirectories(subdirs, fileIndices) {
  if (!fileIndices) {
    return subdirs;
  }
  return subdirs.filter((_, index) => fileIndices.includes(index));
}

/**
 * Gets a specific page file
 * @param {string} jobId - Job ID
 * @param {string} dirName - Directory name
 * @param {string} pageName - Page name
 * @returns {Object|null} Object with filePath and fileName, or null if not found
 */
export function getPageFile(jobId, dirName, pageName) {
  const jobDir = getJobDirectory(jobId);
  const pdfDir = path.join(jobDir, dirName);

  const pageFiles = fs.readdirSync(pdfDir)
    .filter(file => file.toLowerCase().startsWith(pageName.toLowerCase()) && file.endsWith('.jpg'));

  if (pageFiles.length === 0) {
    return null;
  }

  return {
    filePath: path.join(pdfDir, pageFiles[0]),
    fileName: pageFiles[0]
  };
}

/**
 * Gets all JPG files in a directory
 * @param {string} dirPath - Directory path
 * @returns {Array<string>} Array of JPG file names
 */
export function getJpgFiles(dirPath) {
  return fs.readdirSync(dirPath).filter(file => file.endsWith('.jpg'));
}

/**
 * Creates a ZIP file with folders for each PDF
 * @param {string} jobId - Job ID
 * @param {Array<string>} targetDirs - Target directories to include
 * @returns {Promise<Buffer>} ZIP file buffer
 */
export async function createSingleZip(jobId, targetDirs) {
  const zip = new JSZip();
  const jobDir = getJobDirectory(jobId);

  for (const dir of targetDirs) {
    const pdfDir = path.join(jobDir, dir);
    const files = getJpgFiles(pdfDir);

    for (const file of files) {
      const filePath = path.join(pdfDir, file);
      const fileData = fs.readFileSync(filePath);
      zip.folder(dir).file(file, fileData);
    }
  }

  return await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Creates a ZIP file with all images in the root
 * @param {string} jobId - Job ID
 * @param {Array<string>} targetDirs - Target directories to include
 * @returns {Promise<Buffer>} ZIP file buffer
 */
export async function createFlatZip(jobId, targetDirs) {
  const zip = new JSZip();
  const jobDir = getJobDirectory(jobId);

  for (const dir of targetDirs) {
    const pdfDir = path.join(jobDir, dir);
    const files = getJpgFiles(pdfDir);

    for (const file of files) {
      const filePath = path.join(pdfDir, file);
      const fileData = fs.readFileSync(filePath);
      zip.file(`${dir}_${file}`, fileData);
    }
  }

  return await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
}

/**
 * Generates a download filename with timestamp
 * @returns {string} Filename with timestamp
 */
export function generateDownloadFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `pdf-to-jpg-${date}.zip`;
}

