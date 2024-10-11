import type { User } from '@modules/Users/Data/User'
import { BaseModel } from '@modules/Core/Data/Model'
import { BlogPost, Reaction } from '../BlogPost'

export interface BlogPostReaction extends BaseModel {
  post: BlogPost
  postId: string
  user: User
  userId: string
  reaction: Reaction
}
