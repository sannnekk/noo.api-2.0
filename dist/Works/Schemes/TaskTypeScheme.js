import { z } from 'zod';
export const TaskTypeScheme = z.enum([
    'text',
    'one_choice',
    'multiple_choice',
    'word',
]);
