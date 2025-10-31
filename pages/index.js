import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import FileUploader from '../components/FileUploader';
import SettingsPanel from '../components/SettingsPanel';
import ProgressIndicator from '../components/ProgressIndicator';
import ResultsGallery from '../components/ResultsGallery';
import Footer from '../components/Footer';

// PDF converter with server-side processing
function usePdfConverter() {
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const [pagesProcessed, setPagesProcessed] = useState(0);
  const [processingSpeed, setProcessingSpeed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  
  // Use refs to handle interval cleanup properly
  const intervalRef = useRef(null);
  const abortControllerRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Cleanup function to clear intervals and abort requests
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);
  
  // Calculate estimated output size based on settings and file size
  const calculateEstimatedSize = useCallback((fileSize, dpi, quality) => {
    // Basic estimation formula: file_size * (dpi_factor) * (quality_factor)
    const dpiFactors = { '300': 1, '600': 2.5, '1200': 5 };
    const qualityFactors = { '75': 0.7, '85': 0.85, '95': 1 };
    
    const dpiMultiplier = dpiFactors[dpi] || 1;
    const qualityMultiplier = qualityFactors[quality] || 0.85;
    
    return fileSize * dpiMultiplier * qualityMultiplier;
  }, []);
  
  // Server-side conversion function
  const convertFiles = useCallback(async (files, settings) => {
    if (!files || files.length === 0) return;
    
    // Clean up any previous conversion
    cleanup();
    
    try {
      // Initialize conversion state
      setIsConverting(true);
      setIsUploading(true);
      setProgress(0);
      setOverallProgress(0);
      setCompletedFiles(0);
      setPagesProcessed(0);
      setProcessingSpeed(0);
      setError(null);
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      
      // Start tracking time
      startTimeRef.current = Date.now();
      
      // Create form data
      const formData = new FormData();
      
      // Add settings
      formData.append('dpi', settings.dpi || '300');
      formData.append('quality', settings.quality || '95');
      formData.append('parallelProcessing', settings.parallelProcessing || '1');
      
      // Add files
      files.forEach(file => {
        formData.append('pdfFiles', file);
      });
      
      setCurrentFile('Uploading files...');
      
      // Upload files and start conversion
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });
      
      setIsUploading(false);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Conversion failed');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Conversion failed');
      }
      
      // Process results
      setResults(data.results || []);
      setCompletedFiles(files.length);
      setOverallProgress(100);
      setProgress(100);
      
      // Calculate total pages processed
      const totalPages = data.results.reduce((sum, result) => sum + result.pages.length, 0);
      setPagesProcessed(totalPages);
      
      // Calculate processing speed
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      if (elapsedSeconds > 0 && totalPages > 0) {
        setProcessingSpeed((totalPages / elapsedSeconds).toFixed(1));
      }
      
      setIsConverting(false);
      
      return data.results;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Conversion cancelled');
      } else {
        console.error('Conversion error:', error);
        setError(error.message);
      }
      
      setIsConverting(false);
      setIsUploading(false);
      throw error;
    }
  }, [cleanup]);
  
  // Cancel conversion
  const cancelConversion = useCallback(() => {
    cleanup();
    setIsConverting(false);
    setIsUploading(false);
  }, [cleanup]);
  
  return {
    isConverting,
    isUploading,
    progress,
    overallProgress,
    completedFiles,
    currentFile,
    pagesProcessed,
    processingSpeed,
    estimatedTimeRemaining,
    results,
    error,
    convertFiles,
    cancelConversion,
    calculateEstimatedSize
  };
}

export default function Home() {
  const [files, setFiles] = useState([]);
  const [settings, setSettings] = useState({
    dpi: '1200',
    quality: '95',
    exportMethod: 'single-zip',
    parallelProcessing: '4'
  });
  const [estimatedOutputSize, setEstimatedOutputSize] = useState(0);
  const [estimatedProcessingTime, setEstimatedProcessingTime] = useState(0);
  const [conversionError, setConversionError] = useState(null);
  
  const {
    isConverting,
    isUploading,
    progress,
    overallProgress,
    completedFiles,
    currentFile,
    pagesProcessed,
    processingSpeed,
    estimatedTimeRemaining,
    results,
    error,
    convertFiles,
    cancelConversion,
    calculateEstimatedSize
  } = usePdfConverter();
  
  // Handle file selection
  const handleFilesSelected = useCallback((selectedFiles) => {
    setFiles(selectedFiles);
    setConversionError(null);
    
    // Calculate estimated output size
    if (selectedFiles.length > 0) {
      const totalInputSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const estimatedSize = calculateEstimatedSize(totalInputSize, settings.dpi, settings.quality);
      setEstimatedOutputSize(estimatedSize);
      
      // Estimate processing time
      const totalSizeInMB = totalInputSize / (1024 * 1024);
      const baseTimePerMB = 1; // seconds per MB
      const dpiTimeMultiplier = { '300': 1, '600': 2, '1200': 4 }[settings.dpi] || 1;
      const estimatedTime = Math.ceil(totalSizeInMB * baseTimePerMB * dpiTimeMultiplier);
      setEstimatedProcessingTime(estimatedTime);
    }
  }, [calculateEstimatedSize, settings.dpi, settings.quality]);
  
  // Handle settings change
  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    
    // Recalculate estimates when settings change
    if (files.length > 0) {
      const totalInputSize = files.reduce((sum, file) => sum + file.size, 0);
      const estimatedSize = calculateEstimatedSize(totalInputSize, newSettings.dpi, newSettings.quality);
      setEstimatedOutputSize(estimatedSize);
      
      // Estimate processing time
      const totalSizeInMB = totalInputSize / (1024 * 1024);
      const baseTimePerMB = 1; // seconds per MB
      const dpiTimeMultiplier = { '300': 1, '600': 2, '1200': 4 }[newSettings.dpi] || 1;
      const estimatedTime = Math.ceil(totalSizeInMB * baseTimePerMB * dpiTimeMultiplier);
      setEstimatedProcessingTime(estimatedTime);
    }
  }, [files, calculateEstimatedSize]);
  
  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format time for display
  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };
  
  // Start conversion
  const handleStartConversion = async () => {
    if (files.length > 0) {
      setConversionError(null);
      
      try {
        await convertFiles(files, settings);
      } catch (error) {
        setConversionError(error.message);
      }
    }
  };
  
  // Handle downloads
  const handleDownload = async (filename) => {
    if (!results || results.length === 0) return;
    
    try {
      const jobId = results[0]?.jobId;
      
      if (!jobId) {
        console.error('No job ID available for download');
        return;
      }
      
      if (filename) {
        // Download specific PDF
        const fileIndex = results.findIndex(result => result.filename === filename);
        if (fileIndex !== -1) {
          const downloadUrl = `/api/download?jobId=${jobId}&fileIndices=${fileIndex}&exportMethod=${settings.exportMethod}`;
          window.location.href = downloadUrl;
        }
      } else {
        // Download all files
        const downloadUrl = `/api/download?jobId=${jobId}&exportMethod=${settings.exportMethod}`;
        window.location.href = downloadUrl;
      }
    } catch (error) {
      console.error('Download error:', error);
      setConversionError(`Download failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>PDF to JPG High Resolution Converter</title>
        <meta name="description" content="Premium PDF to JPG conversion with high-resolution output" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      
      <main className="flex-grow">
        <Hero />
        
        <Features />
        
        <section id="converter" className="py-20 bg-gradient-to-b from-dark to-dark-100">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="heading-lg mb-6">Convert Your PDF Files</h2>
              <p className="text-body max-w-2xl mx-auto">
                Upload your PDFs and convert them to high-quality JPG images with our premium converter.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              {/* File Uploader */}
              <FileUploader onFilesSelected={handleFilesSelected} />
              
              {/* Settings Panel */}
              <SettingsPanel 
                onChange={handleSettingsChange}
                estimatedSize={estimatedOutputSize > 0 ? formatFileSize(estimatedOutputSize) : null}
                estimatedTime={estimatedProcessingTime > 0 ? formatTime(estimatedProcessingTime) : null}
              />
            </div>
            
            {/* Convert Button */}
            <div className="flex justify-center">
              <motion.button 
                className="btn-primary px-12 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={files.length === 0 || isConverting}
                onClick={handleStartConversion}
                whileHover={files.length > 0 && !isConverting ? { scale: 1.05 } : {}}
                whileTap={files.length > 0 && !isConverting ? { scale: 0.95 } : {}}
              >
                {isConverting ? (isUploading ? 'Uploading...' : 'Converting...') : 'Start Conversion'}
              </motion.button>
            </div>
            
            {/* Error Message */}
            <AnimatePresence>
              {conversionError && (
                <motion.div 
                  className="error-notification mt-6 mx-auto max-w-2xl"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span>Conversion error: {conversionError}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Progress Indicator */}
            <div className="mt-16">
              <AnimatePresence>
                {isConverting && (
                  <ProgressIndicator 
                    currentFile={currentFile}
                    progress={progress}
                    overallProgress={overallProgress}
                    totalFiles={files.length}
                    completedFiles={completedFiles}
                    pagesProcessed={pagesProcessed}
                    processingSpeed={processingSpeed}
                    estimatedTimeRemaining={estimatedTimeRemaining}
                    onCancel={cancelConversion}
                    isUploading={isUploading}
                  />
                )}
              </AnimatePresence>
            </div>
            
            {/* Results Gallery */}
            <div className="mt-16">
              <AnimatePresence>
                {results.length > 0 && !isConverting && (
                  <ResultsGallery 
                    results={results} 
                    onDownload={handleDownload}
                    jobId={results[0]?.jobId}
                    exportMethod={settings.exportMethod}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
} 