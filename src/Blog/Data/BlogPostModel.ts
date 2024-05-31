import { Model } from '@modules/Core/Data/Model'
import { BlogPost } from './BlogPost'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { User } from '@modules/Users/Data/User'
import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	RelationId,
} from 'typeorm'
import { UserModel } from '@modules/Users/Data/UserModel'
import { BlogPostReactionModel } from './Relations/BlogPostReactionModel'
import { BlogPostReaction } from './Relations/BlogPostReaction'
import { Poll } from '@modules/Polls/Data/Poll'
import { PollModel } from '@modules/Polls/Data/PollModel'

@Entity('blog_post')
export class BlogPostModel extends Model implements BlogPost {
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
		}
	}

	@Column({
		name: 'title',
		type: 'varchar',
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

	public static entriesToSearch(): (keyof BlogPost)[] {
		return [
			'title',
			'content',
			'tags',
			'author.name' as any,
			'author.username' as any,
		]
	}
}
