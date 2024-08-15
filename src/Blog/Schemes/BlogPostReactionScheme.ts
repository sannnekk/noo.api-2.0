import { z } from 'zod'
import { Reactions } from '../Data/BlogPost'

export const BlogPostReactionScheme = z.enum(Reactions as [string, ...string[]])
