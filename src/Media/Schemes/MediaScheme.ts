import { z, ZodType } from 'zod'
import { MediaOptions } from '../MediaOptions'
import { Media } from '../Data/Media'

export const MediaScheme: ZodType<Media> = z.object({
  id: z.string().ulid().optional() as ZodType<string>,
  createdAt: z.date().optional() as ZodType<Date>,
  updatedAt: z.date().optional() as ZodType<Date>,
  src: z.string(),
  name: z.string(),
  mimeType: z.enum(
    MediaOptions.allowedFileTypes as [string, ...string[]]
  ) as ZodType<'image/png' | 'image/jpeg'>,
  order: z.number().optional(),
})
