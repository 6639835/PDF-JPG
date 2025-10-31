import { create } from 'zustand';
import type { ConversionSettings, ConversionResult } from '@/types';

interface ConversionState {
  files: File[];
  settings: ConversionSettings;
  results: ConversionResult[];
  estimatedOutputSize: number;
  estimatedProcessingTime: number;
  
  // Actions
  setFiles: (files: File[]) => void;
  updateSettings: (settings: Partial<ConversionSettings>) => void;
  setResults: (results: ConversionResult[]) => void;
  setEstimatedOutputSize: (size: number) => void;
  setEstimatedProcessingTime: (time: number) => void;
  reset: () => void;
}

const initialSettings: ConversionSettings = {
  dpi: '1200',
  quality: '95',
  exportMethod: 'single-zip',
  parallelProcessing: '4',
};

export const useConversionStore = create<ConversionState>((set) => ({
  files: [],
  settings: initialSettings,
  results: [],
  estimatedOutputSize: 0,
  estimatedProcessingTime: 0,

  setFiles: (files) => set({ files }),
  
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
  
  setResults: (results) => set({ results }),
  
  setEstimatedOutputSize: (size) => set({ estimatedOutputSize: size }),
  
  setEstimatedProcessingTime: (time) => set({ estimatedProcessingTime: time }),
  
  reset: () =>
    set({
      files: [],
      results: [],
      estimatedOutputSize: 0,
      estimatedProcessingTime: 0,
    }),
}));

