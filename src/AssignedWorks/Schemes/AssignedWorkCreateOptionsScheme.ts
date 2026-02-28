import { z } from 'zod'

export const AssignedWorkCreateOptionsScheme = z.object({
  studentId: z.string().ulid(),
  workId: z.string().ulid(),
})
