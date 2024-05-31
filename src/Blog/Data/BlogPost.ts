import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { BlogPostReaction } from './Relations/BlogPostReaction'
import { Poll } from '@modules/Polls/Data/Poll'

export type Reaction = 'like' | 'dislike' | 'sad' | 'happy' | 'mindblowing'

export const Reactions: Reaction[] = [
	'like',
	'dislike',
	'sad',
	'happy',
	'mindblowing',
]

export interface BlogPost extends BaseModel {
	title: string
	content: DeltaContentType
	author: User
	authorId?: User['id']
	tags: string[]
	reactions: BlogPostReaction[]
	reactionCounts: Record<Reaction, number>
	poll?: Poll
}
