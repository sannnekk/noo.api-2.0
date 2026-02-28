import { z } from 'zod'

export const AssignWorkOptionsScheme = z.object({
  checkDeadline: z.date().optional(),
  solveDeadline: z.date().optional(),
})
