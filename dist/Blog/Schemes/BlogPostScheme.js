import { z } from 'zod';
import { BlogPostTagsScheme } from './BlogPostTagsScheme.js';
import { MediaScheme } from '../../Media/Schemes/MediaScheme.js';
import { DeltaScheme } from '../../Core/Schemas/DeltaScheme.js';
import { PollScheme } from '../../Polls/Schemes/PollScheme.js';
export const BlogPostScheme = z.object({
    id: z.string().ulid().optional(),
    title: z
        .string()
        .min(1, 'У поста должно быть название')
        .max(255, 'Название поста слишком длинное, максимум 255 символов'),
    content: DeltaScheme.optional(),
    tags: BlogPostTagsScheme.optional(),
    files: z.array(MediaScheme).optional(),
    poll: PollScheme.nullable().optional(),
});
