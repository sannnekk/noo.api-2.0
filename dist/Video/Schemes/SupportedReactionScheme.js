import { z } from 'zod';
export const SupportedReactionScheme = z.enum([
    'like',
    'dislike',
    'happy',
    'sad',
    'mindblowing',
]);
