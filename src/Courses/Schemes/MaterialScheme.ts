import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { MediaScheme } from '@modules/Media/Schemes/MediaScheme'
import { z } from 'zod'

export const MaterialScheme = z.object({
  id: z.string().ulid().optional(),
  slug: z.string().optional().nullable(),
  name: z
    .string()
    .min(1, { message: 'Название материала слишком короткое' })
    .max(255, {
      message: 'Название материала не может быть длиннее 255 символов',
    }),
  order: z.number(),
  isActive: z.boolean().optional(),
  description: z.string().nullable().optional(),
  content: DeltaScheme,
  files: z.array(MediaScheme),
  poll: z
    .object({
      id: z.string().ulid(),
    })
    .nullable()
    .optional(),
  work: z
    .object({
      id: z.string().ulid(),
    })
    .nullable()
    .optional(),
  videos: z
    .array(
      z.object({
        id: z.string().ulid(),
      })
    )
    .optional(),
  isWorkAvailable: z.boolean().default(true),
  workSolveDeadline: z.date().nullable().optional(),
  workCheckDeadline: z.date().nullable().optional(),
  activateAt: z.date().nullable().optional(),
})
