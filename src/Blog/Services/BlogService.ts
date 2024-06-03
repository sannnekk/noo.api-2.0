import { Service } from '@modules/Core/Services/Service'
import { Reaction, type BlogPost } from '../Data/BlogPost'
import { BlogPostRepository } from '../Data/BlogPostRepository'
import { Pagination } from '@modules/Core/Data/Pagination'
import { BlogPostModel } from '../Data/BlogPostModel'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { QueryFailedError } from 'typeorm'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import { UnknownError } from '@modules/Core/Errors/UnknownError'
import { BlogPostReactionRepository } from '../Data/Relations/BlogPostReactionRepository'
import { BlogPostReactionModel } from '../Data/Relations/BlogPostReactionModel'
import { User } from '@modules/Users/Data/User'
import { BlogPostDTO } from '../DTO/BlogPostDTO'

export class BlogService extends Service<BlogPost> {
	private readonly repository: BlogPostRepository
	private readonly reactionRepository: BlogPostReactionRepository

	constructor() {
		super()

		this.repository = new BlogPostRepository()
		this.reactionRepository = new BlogPostReactionRepository()
	}

	public async getAll(pagination: Pagination, userId: User['id']) {
		const relations: (keyof BlogPost)[] = ['author', 'poll']

		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = BlogPostModel.entriesToSearch()

		const posts: BlogPostDTO[] = await this.repository.find(
			undefined,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.repository,
			undefined,
			pagination,
			relations
		)

		const reactions = await this.reactionRepository.find(
			posts.map((post) => ({
				post: { id: post.id },
				user: { id: userId },
			})) as any
		)

		const reactionsMap = new Map<string, Reaction>()

		reactions.forEach((reaction) => {
			reactionsMap.set(reaction.postId, reaction.reaction)
		})

		posts.forEach((post) => {
			post.myReaction = reactionsMap.get(post.id)
		})

		return { posts, meta }
	}

	public async getById(
		id: BlogPost['id'],
		userId?: User['id']
	): Promise<BlogPost | null> {
		const relations: (keyof BlogPost)[] = ['author']

		const post: BlogPostDTO | null = await this.repository.findOne(
			{ id },
			relations
		)

		if (!post) {
			throw new NotFoundError('Пост не найден')
		}

		if (userId) {
			const reaction = await this.reactionRepository.findOne({
				post: { id },
				user: { id: userId },
			})

			if (reaction) {
				post.myReaction = reaction.reaction
			}
		}

		return post
	}

	public async toggleReaction(
		postId: BlogPost['id'],
		userId: User['id'],
		reaction: Reaction
	): Promise<Record<Reaction, number>> {
		const post = await this.getById(postId)

		if (!post) {
			throw new NotFoundError('Пост не найден')
		}

		const reactionCounts = post.reactionCounts
		const reactionCount = reactionCounts[reaction]

		if (reactionCount === undefined) {
			throw new UnknownError('Неизвестная реакция')
		}

		const existingReaction = await this.reactionRepository.findOne({
			post: { id: postId },
			user: { id: userId },
		})

		if (!existingReaction) {
			reactionCounts[reaction] = reactionCount + 1

			const newReaction = new BlogPostReactionModel({
				post: { id: postId } as BlogPost,
				user: { id: userId } as User,
				reaction,
			})

			await this.reactionRepository.create(newReaction)
			const updatedPost = await this.repository.update({
				id: postId,
				reactionCounts,
			})

			return updatedPost.reactionCounts
		}

		const oldReaction = existingReaction.reaction

		if (oldReaction === reaction) {
			reactionCounts[reaction] = reactionCount - 1

			await this.reactionRepository.delete(existingReaction.id)
		} else {
			reactionCounts[oldReaction] = reactionCounts[oldReaction] - 1
			reactionCounts[reaction] = reactionCounts[reaction] + 1

			await this.reactionRepository.update({
				id: existingReaction.id,
				reaction,
			})
		}

		const updatedPost = await this.repository.update({
			id: postId,
			reactionCounts,
		})

		return updatedPost.reactionCounts
	}

	public async create(post: BlogPost, authorId: User['id']): Promise<BlogPost> {
		try {
			post.reactionCounts = {
				like: 0,
				dislike: 0,
				happy: 0,
				sad: 0,
				mindblowing: 0,
			}

			post.author = { id: authorId } as User

			return await this.repository.create(post)
		} catch (error: any) {
			if (error instanceof QueryFailedError) {
				throw new AlreadyExistError()
			}

			throw new UnknownError()
		}
	}

	public async update(post: Partial<BlogPost>): Promise<void> {
		const blogPost = await this.getById(post.id!)

		// cant update a poll
		post.poll = undefined
		post.author = undefined

		if (!blogPost) {
			throw new NotFoundError('Пост не найден')
		}

		const updatedPost = new BlogPostModel({ ...blogPost, ...post })

		await this.repository.update(updatedPost)
	}

	public async delete(id: BlogPost['id']): Promise<void> {
		const blogPost = await this.getById(id)

		if (!blogPost) {
			throw new NotFoundError('Пост не найден')
		}

		await this.repository.delete(id)
	}
}
