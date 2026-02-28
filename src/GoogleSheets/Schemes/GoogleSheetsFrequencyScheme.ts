import { z } from 'zod'

export const GoogleSheetsFrequencyScheme = z.enum([
  'hourly',
  'daily',
  'weekly',
  'monthly',
])
