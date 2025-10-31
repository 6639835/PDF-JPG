// Core types for the PDF to JPG converter

export interface ConversionSettings {
  dpi: '300' | '600' | '1200';
  quality: '75' | '85' | '95';
  exportMethod: 'single-zip' | 'individual' | 'merged-pdf';
  parallelProcessing: '1' | '2' | '4' | '8';
}

export interface PageResult {
  pageNumber: number;
  filename: string;
  path: string;
  size: number;
  width: number;
  height: number;
}

export interface ConversionResult {
  filename: string;
  originalSize: number;
  pages: PageResult[];
  totalSize: number;
  jobId: string;
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

