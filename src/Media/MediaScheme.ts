import { z } from 'zod'
import { MediaOptions } from './MediaOptions'

export const MediaScheme = z.object({
  id: z.string().ulid().optional(),
  src: z.string(),
  name: z.string(),
  mimeType: z.enum(MediaOptions.allowedFileTypes as [string, ...string[]]),
})
