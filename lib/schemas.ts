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
  exportMethod: z.enum(['single-zip', 'individual', 'merged-pdf'], {
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

// Page result schema
export const pageResultSchema = z.object({
  pageNumber: z.number().int().positive(),
  filename: z.string(),
  path: z.string(),
  size: z.number().int().positive(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

// Conversion result schema
export const conversionResultSchema = z.object({
  filename: z.string(),
  originalSize: z.number().int().positive(),
  pages: z.array(pageResultSchema),
  totalSize: z.number().int().positive(),
  jobId: z.string().uuid(),
});

// API response schema
export const conversionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  results: z.array(conversionResultSchema).optional(),
});

// Types inferred from schemas
export type FileValidation = z.infer<typeof fileSchema>;
export type ConversionSettingsValidation = z.infer<typeof conversionSettingsSchema>;
export type ConversionRequest = z.infer<typeof conversionRequestSchema>;
export type PageResultValidation = z.infer<typeof pageResultSchema>;
export type ConversionResultValidation = z.infer<typeof conversionResultSchema>;
export type ConversionResponse = z.infer<typeof conversionResponseSchema>;

