import fs from 'fs';
import path from 'path';
import os from 'os';

const tempDir = path.join(os.tmpdir(), 'pdf-to-jpg-uploads');

/**
 * Ensures the main temporary directory exists
 */
export function ensureTempDirs() {
  if (!fs.existsSync(tempDir)) {
    console.log('Creating main temp directory:', tempDir);
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  cleanupOldDirectories();
}

/**
 * Cleans up temporary directories older than 24 hours
 */
export function cleanupOldDirectories() {
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

/**
 * Creates a unique job directory
 * @param {string} jobId - Unique identifier for the job
 * @returns {string} Path to the job directory
 */
export function createJobDirectory(jobId) {
  const jobDir = path.join(tempDir, jobId);
  fs.mkdirSync(jobDir, { recursive: true });
  return jobDir;
}

/**
 * Schedules cleanup of a job directory after a specified delay
 * @param {string} jobDir - Path to the job directory
 * @param {string} jobId - Job identifier for logging
 * @param {number} delayMs - Delay in milliseconds (default: 1 hour)
 */
export function scheduleCleanup(jobDir, jobId, delayMs = 3600000) {
  setTimeout(() => {
    try {
      console.log(`Cleaning up temporary files for job ${jobId}...`);
      fs.rmSync(jobDir, { recursive: true, force: true });
      console.log(`Cleanup completed for job ${jobId}`);
    } catch (error) {
      console.error(`Error cleaning up temp files for job ${jobId}:`, error);
    }
  }, delayMs);
}

/**
 * Gets the temporary directory path
 * @returns {string} Path to the temporary directory
 */
export function getTempDir() {
  return tempDir;
}

// Initialize temp directories when module is loaded
ensureTempDirs();

