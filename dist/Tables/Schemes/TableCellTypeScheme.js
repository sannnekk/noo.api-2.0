import { z } from 'zod';
export const TableCellTypeScheme = z.enum([
    'text',
    'number',
    'date',
    'percentage',
    'work',
    'user',
    'formula',
]);
