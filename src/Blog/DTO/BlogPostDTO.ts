import { BlogPost, Reaction } from '../Data/BlogPost'

export interface BlogPostDTO extends BlogPost {
	myReaction?: Reaction
}
