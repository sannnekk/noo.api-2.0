import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Reaction, type BlogPost } from './Data/BlogPost'
import { BlogPostReactionScheme } from './Schemes/BlogPostReactionScheme'
import { BlogPostScheme } from './Schemes/BlogPostScheme'

@ErrorConverter()
export class BlogValidator extends Validator {
  public parseCreateBlog(data: unknown): BlogPost {
    return this.parse<BlogPost>(data, BlogPostScheme.omit({ id: true }))
  }

  public parseUpdateBlog(
    data: unknown
  ): Partial<BlogPost> & { id: BlogPost['id'] } {
    return this.parse<Partial<BlogPost> & { id: BlogPost['id'] }>(
      data,
      BlogPostScheme.omit({ poll: true })
    )
  }

  public parseReaction(data: unknown): Reaction {
    return this.parse<Reaction>(data, BlogPostReactionScheme)
  }
}
