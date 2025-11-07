import { FC, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import FileUploader from '@/components/FileUploader';
import SettingsPanel from '@/components/SettingsPanel';
import ProgressIndicator from '@/components/ProgressIndicator';
import ResultsGallery from '@/components/ResultsGallery';
import Footer from '@/components/Footer';

// Hooks and utilities
import { useConversionStore } from '@/store/useConversionStore';
import { formatFileSize, formatTime, calculateEstimatedSize, calculateEstimatedTime } from '@/lib/utils';
import type { ConversionSettings, ConversionResult } from '@/types';

// Server-side conversion handler with abort controller support
const useServerConversion = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedFiles, setCompletedFiles] = useState(0);
  const [pagesProcessed, setPagesProcessed] = useState(0);
  const [processingSpeed, setProcessingSpeed] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to handle abort controller
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  const convertFiles = useCallback(async (files: File[], settings: ConversionSettings) => {
    if (!files || files.length === 0) return;

    // Cancel any previous conversion
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      // Initialize conversion state
      setIsConverting(true);
      setIsUploading(true);
      setProgress(0);
      setOverallProgress(0);
      setCompletedFiles(0);
      setPagesProcessed(0);
      setProcessingSpeed(0);
      setEstimatedTimeRemaining(0);
      setError(null);
      setCurrentFile('Uploading files...');

      startTimeRef.current = Date.now();

      // Create form data
      const formData = new FormData();
      formData.append('dpi', settings.dpi);
      formData.append('quality', settings.quality);
      formData.append('parallelProcessing', settings.parallelProcessing);

      // Add files
      files.forEach(file => {
        formData.append('pdfFiles', file);
      });

      // Upload files and start conversion
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
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
      const totalPages = data.results?.reduce(
        (sum: number, result: ConversionResult) => sum + result.pages.length, 
        0
      ) || 0;
      setPagesProcessed(totalPages);

      // Calculate processing speed
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      if (elapsedSeconds > 0 && totalPages > 0) {
        setProcessingSpeed(Number((totalPages / elapsedSeconds).toFixed(1)));
      }

      setIsConverting(false);
      return data.results;
    } catch (error) {
      // Don't show error if the request was aborted (user cancelled)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Conversion cancelled by user');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Conversion failed';
        console.error('Conversion error:', error);
        setError(errorMessage);
      }
      
      setIsConverting(false);
      setIsUploading(false);
      throw error;
    }
  }, []);

  const cancelConversion = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConverting(false);
    setIsUploading(false);
  }, []);

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
  };
};

const Home: FC = () => {
  const { settings, setFiles, updateSettings } = useConversionStore();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [estimatedOutputSize, setEstimatedOutputSize] = useState(0);
  const [estimatedProcessingTime, setEstimatedProcessingTime] = useState(0);
  const [conversionError, setConversionError] = useState<string | null>(null);

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
  } = useServerConversion();

  // Handle file selection
  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setLocalFiles(selectedFiles);
    setFiles(selectedFiles);
    setConversionError(null);

    // Calculate estimated output size
    if (selectedFiles.length > 0) {
      const totalInputSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const estimatedSize = calculateEstimatedSize(totalInputSize, settings.dpi, settings.quality);
      setEstimatedOutputSize(estimatedSize);

      // Estimate processing time
      const estimatedTime = calculateEstimatedTime(totalInputSize, settings.dpi);
      setEstimatedProcessingTime(estimatedTime);
    }
  }, [settings.dpi, settings.quality, setFiles]);

  // Handle settings change
  const handleSettingsChange = useCallback((newSettings: ConversionSettings) => {
    updateSettings(newSettings);

    // Recalculate estimates when settings change
    if (localFiles.length > 0) {
      const totalInputSize = localFiles.reduce((sum, file) => sum + file.size, 0);
      const estimatedSize = calculateEstimatedSize(totalInputSize, newSettings.dpi, newSettings.quality);
      setEstimatedOutputSize(estimatedSize);

      // Estimate processing time
      const estimatedTime = calculateEstimatedTime(totalInputSize, newSettings.dpi);
      setEstimatedProcessingTime(estimatedTime);
    }
  }, [localFiles, updateSettings]);

  // Start conversion
  const handleStartConversion = async () => {
    if (localFiles.length > 0) {
      setConversionError(null);

      try {
        await convertFiles(localFiles, settings);
      } catch (error) {
        // Only show error if it wasn't an abort
        if (error instanceof Error && error.name !== 'AbortError') {
          const errorMessage = error.message;
          console.error('Conversion error:', error);
          setConversionError(errorMessage);
        }
      }
    }
  };

  // Handle downloads
  const handleDownload = async (filename?: string) => {
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
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      console.error('Download error:', error);
      setConversionError(`Download failed: ${errorMessage}`);
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
                disabled={localFiles.length === 0 || isConverting}
                onClick={handleStartConversion}
                whileHover={localFiles.length > 0 && !isConverting ? { scale: 1.05 } : {}}
                whileTap={localFiles.length > 0 && !isConverting ? { scale: 0.95 } : {}}
                type="button"
              >
                {isConverting ? (isUploading ? 'Uploading...' : 'Converting...') : 'Start Conversion'}
              </motion.button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {(conversionError || error) && (
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
                    <span>Conversion error: {conversionError || error}</span>
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
                    totalFiles={localFiles.length}
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
};

export default Home;
