import { Repository } from '@modules/Core/Data/Repository'
import { BlogPostModel } from './BlogPostModel'
import { BlogPost } from './BlogPost'

export class BlogPostRepository extends Repository<BlogPost> {
	public constructor() {
		super(BlogPostModel)
	}
}
