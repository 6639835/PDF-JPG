import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import type { ConversionSettings, ConversionResult } from '@/types';
import { conversionSettingsSchema } from '@/lib/schemas';

interface ConversionResponse {
  success: boolean;
  message?: string;
  results?: ConversionResult[];
}

interface ConversionProgress {
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

export function useConversion() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<ConversionProgress>({
    isConverting: false,
    isUploading: false,
    progress: 0,
    overallProgress: 0,
    completedFiles: 0,
    currentFile: '',
    pagesProcessed: 0,
    processingSpeed: 0,
    estimatedTimeRemaining: 0,
  });

  const convertMutation = useMutation({
    mutationFn: async ({ files, settings }: { files: File[]; settings: ConversionSettings }) => {
      // Validate settings
      const validatedSettings = conversionSettingsSchema.parse(settings);
      
      // Create form data
      const formData = new FormData();
      formData.append('dpi', validatedSettings.dpi);
      formData.append('quality', validatedSettings.quality);
      formData.append('parallelProcessing', validatedSettings.parallelProcessing);
      
      // Add files
      files.forEach(file => {
        formData.append('pdfFiles', file);
      });

      // Set uploading state
      setProgress(prev => ({
        ...prev,
        isConverting: true,
        isUploading: true,
        currentFile: 'Uploading files...',
      }));

      const startTime = Date.now();

      // Upload and convert
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Conversion failed');
      }

      const data: ConversionResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Conversion failed');
      }

      // Calculate processing metrics
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const totalPages = data.results?.reduce((sum, result) => sum + result.pages.length, 0) || 0;

      setProgress({
        isConverting: false,
        isUploading: false,
        progress: 100,
        overallProgress: 100,
        completedFiles: files.length,
        currentFile: '',
        pagesProcessed: totalPages,
        processingSpeed: elapsedSeconds > 0 ? totalPages / elapsedSeconds : 0,
        estimatedTimeRemaining: 0,
      });

      return data.results || [];
    },
    onError: (error) => {
      console.error('Conversion error:', error);
      setProgress(prev => ({
        ...prev,
        isConverting: false,
        isUploading: false,
      }));
    },
    onSuccess: () => {
      // Invalidate queries if needed
      queryClient.invalidateQueries({ queryKey: ['conversions'] });
    },
  });

  const resetProgress = () => {
    setProgress({
      isConverting: false,
      isUploading: false,
      progress: 0,
      overallProgress: 0,
      completedFiles: 0,
      currentFile: '',
      pagesProcessed: 0,
      processingSpeed: 0,
      estimatedTimeRemaining: 0,
    });
  };

  return {
    convert: convertMutation.mutate,
    convertAsync: convertMutation.mutateAsync,
    isConverting: convertMutation.isPending || progress.isConverting,
    isError: convertMutation.isError,
    error: convertMutation.error,
    data: convertMutation.data,
    progress,
    resetProgress,
  };
}

