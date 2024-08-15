import { z } from 'zod';
export const WorkTypeScheme = z.enum([
    'trial-work',
    'phrase',
    'mini-test',
    'test',
    'second-part',
]);
