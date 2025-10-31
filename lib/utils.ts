// Utility functions for the PDF to JPG converter

/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format seconds to human-readable time
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

/**
 * Calculate estimated output size based on settings
 */
export function calculateEstimatedSize(
  fileSize: number,
  dpi: '300' | '600' | '1200',
  quality: '75' | '85' | '95'
): number {
  const dpiFactors = { '300': 1, '600': 2.5, '1200': 5 };
  const qualityFactors = { '75': 0.7, '85': 0.85, '95': 1 };
  
  const dpiMultiplier = dpiFactors[dpi] || 1;
  const qualityMultiplier = qualityFactors[quality] || 0.85;
  
  return fileSize * dpiMultiplier * qualityMultiplier;
}

/**
 * Calculate estimated processing time
 */
export function calculateEstimatedTime(
  totalSizeInBytes: number,
  dpi: '300' | '600' | '1200'
): number {
  const totalSizeInMB = totalSizeInBytes / (1024 * 1024);
  const baseTimePerMB = 1; // seconds per MB
  const dpiTimeMultiplier = { '300': 1, '600': 2, '1200': 4 }[dpi] || 1;
  return Math.ceil(totalSizeInMB * baseTimePerMB * dpiTimeMultiplier);
}

/**
 * Validate file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeInMB: number = 50): boolean {
  return file.size <= maxSizeInMB * 1024 * 1024;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

