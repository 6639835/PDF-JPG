// Core types for the PDF to JPG converter

export interface ConversionSettings {
  dpi: '300' | '600' | '1200';
  quality: '75' | '85' | '95';
  exportMethod: 'single-zip' | 'multiple-zip' | 'no-zip' | 'individual' | 'merged-pdf';
  parallelProcessing: '1' | '2' | '4' | '8';
}

export interface PageResult {
  pageNumber: number;
  dataUrl: string; // Base64 thumbnail for preview
  width: number;
  height: number;
  path: string;
  error?: string; // Optional error if page failed to process
}

export interface ConversionResult {
  filename: string;
  originalFilename?: string;
  safeFolderName?: string;
  pages: PageResult[];
  totalPages: number;
  jobId: string;
  error?: string; // Optional error if file failed to process
}

export interface ConversionProgress {
  isConverting: boolean;
  isUploading: boolean;
  progress: number;
  overallProgress: number;
  completedFiles: number;
  currentFile: string;
  pagesProcessed: number;
  processingSpeed: number;
  estimatedTimeRemaining: number;
}

export interface ConversionError {
  message: string;
  code?: string;
  details?: unknown;
}

export type Theme = 'light' | 'dark';
