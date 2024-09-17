import { z } from 'zod';
export const TaskTypeScheme = z.enum(['text', 'essay', 'final-essay', 'word']);
