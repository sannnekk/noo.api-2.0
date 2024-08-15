import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { User } from '@modules/Users/Data/User'
import {
  Brackets,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import { UserModel } from '@modules/Users/Data/UserModel'
import { Poll } from '@modules/Polls/Data/Poll'
import { PollModel } from '@modules/Polls/Data/PollModel'
import { BlogPostReactionModel } from './Relations/BlogPostReactionModel'
import { BlogPostReaction } from './Relations/BlogPostReaction'
import { BlogPost } from './BlogPost'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { Media } from '@modules/Media/Data/Media'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { config } from '@modules/config'

@Entity('blog_post')
export class BlogPostModel extends SearchableModel implements BlogPost {
  constructor(data?: Partial<BlogPost>) {
    super()

    if (data) {
      this.set(data)

      if (data.author) {
        this.author = new UserModel(data.author)
      }

      if (data.poll) {
        this.poll = new PollModel(data.poll)
      }

      if (data.files) {
        this.files = data.files.map((file) => new MediaModel(file))
      }
    }
  }

  @Column({
    name: 'title',
    type: 'varchar',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  title!: string

  @Column({
    name: 'content',
    type: 'json',
  })
  content!: DeltaContentType

  @ManyToOne(() => UserModel, (user) => user.blogPosts)
  author!: User

  @RelationId((post: BlogPostModel) => post.author)
  authorId?: User['id']

  @Column({
    name: 'tags',
    type: 'simple-array',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  tags!: string[]

  @OneToMany(() => BlogPostReactionModel, (reaction) => reaction.post, {
    cascade: true,
  })
  reactions!: BlogPostReaction[]

  @Column({
    name: 'reaction_counts',
    type: 'json',
  })
  reactionCounts!: BlogPost['reactionCounts']

  @OneToOne(() => PollModel, (poll) => poll.post, { cascade: true })
  @JoinColumn()
  poll?: Poll

  @RelationId((post: BlogPostModel) => post.poll)
  pollId?: string

  @OneToMany(() => MediaModel, (media) => media.blogPost, {
    cascade: true,
    eager: true,
  })
  files?: Media[]

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.orWhere('blog_post.title LIKE :needle', { needle: `%${needle}%` })
        qb.orWhere('blog_post.content LIKE :needle', { needle: `%${needle}%` })
        qb.orWhere('blog_post.tags LIKE :needle', { needle: `%${needle}%` })
      })
    )

    return []
  }
}
