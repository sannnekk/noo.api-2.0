import { z } from 'zod';
import { Reactions } from '../Data/BlogPost.js';
export const BlogPostReactionScheme = z.enum(Reactions);
