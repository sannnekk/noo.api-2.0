import { z } from 'zod';
import { GoogleSheetsFrequencyScheme } from './GoogleSheetsFrequencyScheme.js';
export const GoogleSheetsBindingScheme = z.object({
    name: z.string(),
    entityName: z.string(),
    entitySelector: z.object({
        prop: z.string(),
        value: z.string(),
    }),
    googleOAuthToken: z.string(),
    googleCredentials: z.any(),
    status: z.enum(['active', 'inactive', 'error']),
    frequency: GoogleSheetsFrequencyScheme,
});
