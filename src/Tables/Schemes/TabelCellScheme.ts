import { z } from 'zod'
import { TableCellTypeScheme } from './TableCellTypeScheme'

export const TableCellScheme = z.object({
  id: z.string().ulid().nullable().optional(),
  value: z
    .string()
    .max(255, {
      message: 'Значение в ячейке не должно превышать 255 символов',
    })
    .nullable()
    .optional(),
  type: TableCellTypeScheme,
  row: z.number().int(),
  col: z.number().int(),
  background: z.string().optional().nullable(),
  metadata: z.any().optional().nullable(),
})
