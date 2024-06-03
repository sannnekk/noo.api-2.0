import { User } from '@modules/Users/Data/User'
import { BlogPost, Reaction } from '../BlogPost'
import { BaseModel } from '@modules/Core/Data/Model'

export interface BlogPostReaction extends BaseModel {
	post: BlogPost
	postId: string
	user: User
	userId: string
	reaction: Reaction
}
