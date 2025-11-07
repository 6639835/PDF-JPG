import { z } from 'zod';

// File validation schema
export const fileSchema = z.object({
  name: z.string(),
  size: z.number().max(50 * 1024 * 1024, 'File size must be less than 50MB'),
  type: z.string().refine((type) => type === 'application/pdf', {
    message: 'Only PDF files are allowed',
  }),
});

// Conversion settings schema
export const conversionSettingsSchema = z.object({
  dpi: z.enum(['300', '600', '1200'], {
    errorMap: () => ({ message: 'DPI must be 300, 600, or 1200' }),
  }),
  quality: z.enum(['75', '85', '95'], {
    errorMap: () => ({ message: 'Quality must be 75, 85, or 95' }),
  }),
  exportMethod: z.enum(['single-zip', 'multiple-zip', 'no-zip', 'individual', 'merged-pdf'], {
    errorMap: () => ({ message: 'Invalid export method' }),
  }),
  parallelProcessing: z.enum(['1', '2', '4', '8'], {
    errorMap: () => ({ message: 'Parallel processing must be 1, 2, 4, or 8' }),
  }),
});

// API request schema for conversion
export const conversionRequestSchema = z.object({
  files: z.array(fileSchema).min(1, 'At least one file is required').max(10, 'Maximum 10 files allowed'),
  settings: conversionSettingsSchema,
});

// Page result schema - matches actual API response
export const pageResultSchema = z.object({
  pageNumber: z.number().int().positive(),
  dataUrl: z.string(), // Base64 thumbnail
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  path: z.string(),
  error: z.string().optional(),
});

// Conversion result schema - matches actual API response
export const conversionResultSchema = z.object({
  filename: z.string(),
  originalFilename: z.string().optional(),
  safeFolderName: z.string().optional(),
  pages: z.array(pageResultSchema),
  totalPages: z.number().int().positive(),
  jobId: z.string().uuid(),
  error: z.string().optional(),
});

// API response schema
export const conversionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  results: z.array(conversionResultSchema).optional(),
  jobId: z.string().uuid().optional(),
});

// Types inferred from schemas
export type FileValidation = z.infer<typeof fileSchema>;
export type ConversionSettingsValidation = z.infer<typeof conversionSettingsSchema>;
export type ConversionRequest = z.infer<typeof conversionRequestSchema>;
export type PageResultValidation = z.infer<typeof pageResultSchema>;
export type ConversionResultValidation = z.infer<typeof conversionResultSchema>;
export type ConversionResponse = z.infer<typeof conversionResponseSchema>;
