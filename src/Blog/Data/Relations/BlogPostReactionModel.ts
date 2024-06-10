import { Model } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { UserModel } from '@modules/Users/Data/UserModel'
import { BlogPostReaction } from './BlogPostReaction'
import { BlogPost, Reaction } from '../BlogPost'
import { BlogPostModel } from '../BlogPostModel'

@Entity('blog_post_reaction')
export class BlogPostReactionModel extends Model implements BlogPostReaction {
  constructor(data?: Partial<BlogPostReaction>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @ManyToOne(() => BlogPostModel, (post) => post.reactions, {
    onDelete: 'CASCADE',
  })
  post!: BlogPost

  @RelationId((reaction: BlogPostReactionModel) => reaction.post)
  postId!: string

  @ManyToOne(() => UserModel, (user) => user.blogPostReactions)
  user!: User

  @RelationId((reaction: BlogPostReactionModel) => reaction.user)
  userId!: string

  @Column({
    name: 'reaction',
    type: 'varchar',
  })
  reaction!: Reaction
}
