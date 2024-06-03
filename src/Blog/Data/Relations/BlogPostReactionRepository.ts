import { Repository } from '@modules/Core/Data/Repository'
import { BlogPostReaction } from './BlogPostReaction'
import { BlogPostReactionModel } from './BlogPostReactionModel'

export class BlogPostReactionRepository extends Repository<BlogPostReaction> {
	constructor() {
		super(BlogPostReactionModel)
	}
}
