import { z } from 'zod'
import { MediaOptions } from './MediaOptions'

export const MediaScheme = z.object({
	src: z.string(),
	name: z.string(),
	mimeType: z.enum(MediaOptions.allowedFileTypes as [string, ...string[]]),
})
