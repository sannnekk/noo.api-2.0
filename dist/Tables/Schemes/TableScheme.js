import { z } from 'zod';
import { TableCellScheme } from './TabelCellScheme.js';
export const TableScheme = z.object({
    id: z.string().ulid().nullable().optional(),
    title: z
        .string()
        .min(2, {
        message: 'Название таблицы не должно быть меньше 2 символов',
    })
        .max(120, {
        message: 'Название таблицы не должно превышать 120 символов',
    }),
    cells: z.array(TableCellScheme),
    /* .transform((value) =>
        value.filter((cell) => cell.value !== null && cell.value?.trim() !== '')
      ) */
});
