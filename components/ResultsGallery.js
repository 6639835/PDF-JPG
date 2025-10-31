import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultsGallery({ results = [], onDownload, jobId, exportMethod = 'single-zip' }) {
  const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  if (!results || results.length === 0) {
    return null;
  }

  const handleTabClick = (index) => {
    setSelectedPdfIndex(index);
  };

  const openPreview = (imageUrl, pageIndex) => {
    setPreviewImage(imageUrl);
    setPreviewIndex(pageIndex);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const navigatePrev = useCallback(() => {
    if (!previewImage) return;
    
    const currentPages = results[selectedPdfIndex].pages;
    if (previewIndex > 0) {
      const prevIndex = previewIndex - 1;
      setPreviewImage(currentPages[prevIndex].dataUrl);
      setPreviewIndex(prevIndex);
    }
  }, [previewImage, previewIndex, results, selectedPdfIndex]);

  const navigateNext = useCallback(() => {
    if (!previewImage) return;
    
    const currentPages = results[selectedPdfIndex].pages;
    if (previewIndex < currentPages.length - 1) {
      const nextIndex = previewIndex + 1;
      setPreviewImage(currentPages[nextIndex].dataUrl);
      setPreviewIndex(nextIndex);
    }
  }, [previewImage, previewIndex, results, selectedPdfIndex]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!previewImage) return;
      
      switch (e.key) {
        case 'ArrowRight':
          navigateNext();
          break;
        case 'ArrowLeft':
          navigatePrev();
          break;
        case 'Escape':
          closePreview();
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, navigateNext, navigatePrev]);

  const downloadCurrent = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      if (jobId) {
        // Server-side download
        const downloadUrl = `/api/download?jobId=${jobId}&fileIndices=${selectedPdfIndex}&exportMethod=${exportMethod}`;
        window.location.href = downloadUrl;
      } else if (onDownload && results[selectedPdfIndex]) {
        // Client-side fallback
        onDownload(results[selectedPdfIndex].filename);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + error.message);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const downloadAll = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      if (jobId) {
        // Server-side download
        const downloadUrl = `/api/download?jobId=${jobId}&exportMethod=${exportMethod}`;
        window.location.href = downloadUrl;
      } else if (onDownload) {
        // Client-side fallback
        onDownload();
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + error.message);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const downloadSingleImage = async (imageUrl, pageNumber, filename) => {
    try {
      setIsDownloading(true);
      
      if (jobId) {
        // Create a fetch request to get the actual image data (not the thumbnail)
        const pageName = `page-${pageNumber}`;
        const fileIndex = results.findIndex(r => r.filename === filename);
        const downloadUrl = `/api/download?jobId=${jobId}&fileIndices=${fileIndex}&pageName=${pageName}&originalFilename=${encodeURIComponent(filename.replace('.pdf', ''))}`;
        
        window.location.href = downloadUrl;
      } else {
        // Fallback to client-side downloading using the dataUrl
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `${filename.replace('.pdf', '')}_page${pageNumber}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed: ' + error.message);
    } finally {
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const totalPages = results.reduce((sum, result) => sum + result.pages.length, 0);

  return (
    <motion.div 
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="heading-sm">Conversion Results</h3>
        <div className="text-white/60 text-sm mt-2 sm:mt-0">
          {totalPages} page{totalPages !== 1 ? 's' : ''} from {results.length} file{results.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* PDF Tabs */}
      {results.length > 1 && (
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex space-x-2">
            {results.map((result, index) => (
              <button
                key={index}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded-md transition-colors duration-300
                          ${selectedPdfIndex === index 
                            ? 'bg-primary text-dark-100' 
                            : 'bg-dark-300 text-white/70 hover:bg-dark-400'}`}
                onClick={() => handleTabClick(index)}
              >
                {result.filename} ({result.pages.length})
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Preview Grid */}
      <div className="mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPdfIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results[selectedPdfIndex]?.pages.map((page, pageIndex) => (
                <motion.div
                  key={pageIndex}
                  className="image-frame aspect-[3/4] group cursor-pointer relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: pageIndex * 0.05 }}
                  onClick={() => openPreview(page.dataUrl, pageIndex)}
                  whileHover={{ scale: 1.02 }}
                >
                  <img 
                    src={page.dataUrl} 
                    alt={`Page ${pageIndex + 1}`} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="image-frame-caption">
                    <p className="text-white/90 text-sm">Page {pageIndex + 1}</p>
                  </div>
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSingleImage(
                          page.dataUrl, 
                          pageIndex + 1, 
                          results[selectedPdfIndex].filename
                        );
                      }}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary-600 transition-colors"
                      aria-label="Download page"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-dark-100" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Download Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={downloadAll}
          whileHover={{ scale: isDownloading ? 1 : 1.02 }}
          whileTap={{ scale: isDownloading ? 1 : 0.98 }}
          disabled={isDownloading}
        >
          <span className="flex items-center justify-center">
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparing Download...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download All Files ({totalPages} pages)
              </>
            )}
          </span>
        </motion.button>
        
        <motion.button
          className="btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={downloadCurrent}
          whileHover={{ scale: isDownloading ? 1 : 1.02 }}
          whileTap={{ scale: isDownloading ? 1 : 0.98 }}
          disabled={isDownloading}
        >
          <span className="flex items-center justify-center">
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Preparing Download...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download "{results[selectedPdfIndex]?.filename}" ({results[selectedPdfIndex]?.pages.length} pages)
              </>
            )}
          </span>
        </motion.button>
      </div>
      
      {/* Full Screen Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePreview}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={previewImage} 
                alt={`Page ${previewIndex + 1}`} 
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-glass-lg"
              />
              
              <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-dark-100/80 to-transparent">
                <span className="text-white/90">
                  Page {previewIndex + 1} of {results[selectedPdfIndex]?.pages.length} - {results[selectedPdfIndex]?.filename}
                </span>
                <button
                  className="w-10 h-10 rounded-full bg-dark-400/90 flex items-center justify-center
                             hover:bg-dark-300 transition-colors duration-300"
                  onClick={closePreview}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  className="btn-secondary py-2 px-4"
                  onClick={() => downloadSingleImage(
                    previewImage, 
                    previewIndex + 1, 
                    results[selectedPdfIndex].filename
                  )}
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </span>
                </button>
              </div>
              
              {/* Navigation Arrows */}
              <div className="absolute inset-y-0 left-4 flex items-center">
                {previewIndex > 0 && (
                  <button 
                    className="w-12 h-12 rounded-full bg-dark-300/50 hover:bg-dark-300/80 flex items-center justify-center transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigatePrev();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="absolute inset-y-0 right-4 flex items-center">
                {previewIndex < results[selectedPdfIndex]?.pages.length - 1 && (
                  <button 
                    className="w-12 h-12 rounded-full bg-dark-300/50 hover:bg-dark-300/80 flex items-center justify-center transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateNext();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 