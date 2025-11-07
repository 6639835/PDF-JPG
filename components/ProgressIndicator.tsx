import { motion } from 'framer-motion';
import { FC } from 'react';

interface ProgressIndicatorProps {
  currentFile: string;
  progress: number;
  overallProgress: number;
  totalFiles: number;
  completedFiles: number;
  pagesProcessed: number;
  processingSpeed: number;
  estimatedTimeRemaining: number;
  onCancel: () => void;
  isUploading: boolean;
}

const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  currentFile,
  progress,
  overallProgress,
  totalFiles,
  completedFiles,
  pagesProcessed,
  processingSpeed,
  estimatedTimeRemaining,
  onCancel,
  isUploading
}) => {
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds === 0) return 'Almost done';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes} min ${remainingSeconds} sec`;
  };

  return (
    <motion.div
      className="card-glass p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="heading-sm">Conversion Progress</h3>
        <button 
          onClick={onCancel}
          className="btn-text py-1 px-3 text-xs"
          disabled={isUploading}
          aria-label="Cancel conversion"
        >
          Cancel
        </button>
      </div>

      {/* Current file */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-white/70 text-sm">
            {isUploading ? 'Uploading files...' : `Processing: ${currentFile || 'Preparing...'}`}
          </p>
          <span className="text-primary text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Overall progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-white/70 text-sm">Overall Progress</p>
          <span className="text-primary text-sm font-medium">{completedFiles}/{totalFiles} files</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${overallProgress}%` }}
            role="progressbar"
            aria-valuenow={overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="card-glass p-3 flex justify-between items-center">
          <span className="text-white/60">Pages Processed</span>
          <span className="text-primary-400 font-medium">{pagesProcessed}</span>
        </div>
        
        <div className="card-glass p-3 flex justify-between items-center">
          <span className="text-white/60">Processing Speed</span>
          <span className="text-primary-400 font-medium">{processingSpeed} pages/sec</span>
        </div>
        
        <div className="card-glass p-3 flex justify-between items-center col-span-1 md:col-span-2">
          <span className="text-white/60">Estimated Time Remaining</span>
          <span className="text-primary-400 font-medium">
            {isUploading ? 'Calculating...' : formatTimeRemaining(estimatedTimeRemaining)}
          </span>
        </div>
      </div>
      
      {isUploading && (
        <div className="mt-4 text-center text-white/70 text-sm">
          <p>Uploading and preparing files for conversion. This may take a few moments depending on file size.</p>
        </div>
      )}
    </motion.div>
  );
};

export default ProgressIndicator;

