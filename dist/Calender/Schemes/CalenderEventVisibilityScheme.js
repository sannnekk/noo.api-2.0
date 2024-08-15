import { z } from 'zod';
export const CalenderEventVisibilityScheme = z.enum([
    'all',
    'own-students',
    'all-mentors',
    'own-mentor',
    'private',
]);
