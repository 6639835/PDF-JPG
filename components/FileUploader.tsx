import { FC, useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatFileSize } from '@/lib/utils';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

interface ValidationResult {
  valid: boolean;
  message?: string;
}

const FileUploader: FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onFilesSelectedRef = useRef(onFilesSelected);
  const isInitialMount = useRef(true);
  
  // Update the ref when callback changes
  useEffect(() => {
    onFilesSelectedRef.current = onFilesSelected;
  }, [onFilesSelected]);
  
  // Notify parent when files change (using ref to avoid dependency loop)
  useEffect(() => {
    // Skip the initial mount to avoid triggering with empty array
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (onFilesSelectedRef.current) {
      onFilesSelectedRef.current(files);
    }
  }, [files]);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  // Validate PDF file using PDF.js
  const validatePdfFile = async (file: File): Promise<ValidationResult> => {
    try {
      // Check file extension first
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return { valid: false, message: 'File extension must be .pdf' };
      }
      
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        return { valid: false, message: `File size exceeds 50MB limit: ${file.name}` };
      }
      
      // Use PDF magic number to check if the file is a valid PDF
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      
      // Check PDF magic number (%PDF-)
      if (typedArray.length < 5 || 
          typedArray[0] !== 0x25 || // %
          typedArray[1] !== 0x50 || // P
          typedArray[2] !== 0x44 || // D
          typedArray[3] !== 0x46 || // F
          typedArray[4] !== 0x2D) { // -
        return { valid: false, message: 'Invalid PDF file format' };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('PDF validation error:', error);
      return { valid: false, message: `Invalid PDF: ${(error as Error).message}` };
    }
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    // Clear any previous error message
    setErrorMessage('');
    
    if (fileList.length === 0) return;
    
    setIsValidating(true);
    
    const allFiles = Array.from(fileList);
    const pdfFiles = allFiles.filter(file => 
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );
    
    // Show error if any non-PDF files were included
    if (pdfFiles.length < allFiles.length) {
      const nonPdfCount = allFiles.length - pdfFiles.length;
      setErrorMessage(`${nonPdfCount} file(s) ignored: Only PDF files are supported.`);
    }
    
    if (pdfFiles.length === 0) {
      if (allFiles.length > 0) {
        setErrorMessage('No valid PDF files found. Please select PDF files only.');
      }
      setIsValidating(false);
      return;
    }
    
    // Validate each PDF file
    const validatedFiles: File[] = [];
    const invalidFiles: { name: string; error: string }[] = [];
    
    for (const file of pdfFiles) {
      const validation = await validatePdfFile(file);
      if (validation.valid) {
        validatedFiles.push(file);
      } else {
        invalidFiles.push({ name: file.name, error: validation.message || 'Invalid file' });
      }
    }
    
    if (invalidFiles.length > 0) {
      setErrorMessage(`${invalidFiles.length} invalid PDF file(s) detected. Only valid PDF files will be processed.`);
    }
    
    setFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      validatedFiles.forEach(file => {
        // Check if file already exists in the array
        if (!updatedFiles.some(f => f.name === file.name)) {
          updatedFiles.push(file);
        }
      });
      
      return updatedFiles;
    });
    
    setIsValidating(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const handleBrowseClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const removeFile = useCallback((fileName: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.name !== fileName));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        className={`dropzone ${isDragging ? 'active' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleBrowseClick();
          }
        }}
        aria-label="Drop PDF files here or click to browse"
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf,.pdf"
          multiple
          onChange={handleFileInputChange}
        />
        
        <motion.div 
          className="flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-20 h-20 mb-4 text-primary/80">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 15v3H6v-3H4v3c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-3h-2zm-1-4l-1.41-1.41L13 12.17V4h-2v8.17L8.41 9.59 7 11l5 5 5-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-light mb-2 text-white/90">Drop PDF files here</h3>
          <p className="text-white/60 text-sm mb-2">or</p>
          <button className="btn-secondary py-2 px-4 text-xs" type="button">Browse Files</button>
          <p className="text-white/40 text-xs mt-4">Multiple PDF files supported</p>
        </motion.div>
      </div>

      {/* Validation indicator */}
      <AnimatePresence>
        {isValidating && (
          <motion.div 
            className="mt-4 py-2 px-4 bg-dark-200 border-l-4 border-primary-400 text-white/80 text-sm flex items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Validating PDF files...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            className="error-notification"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      {files.length > 0 && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-light text-white/90">Uploaded Files ({files.length})</h3>
            <button 
              onClick={clearAllFiles} 
              className="btn-text py-1 px-2 text-xs"
              type="button"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            <AnimatePresence>
              {files.map((file, index) => (
                <motion.div
                  key={file.name}
                  className="card-glass p-4 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="mr-4 text-primary/80">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 16h8v2H8zm0-4h8v2H8zm6-10H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 text-sm font-medium truncate">{file.name}</p>
                    <p className="text-white/50 text-xs">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.name);
                    }}
                    className="ml-2 text-white/50 hover:text-primary transition-colors p-1"
                    aria-label={`Remove ${file.name}`}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <motion.div 
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button 
              className="btn-secondary w-full"
              onClick={handleBrowseClick}
              type="button"
            >
              Add More Files
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploader;

