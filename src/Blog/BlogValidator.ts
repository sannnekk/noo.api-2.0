import { z } from 'zod'
import { Validator } from '@modules/Core/Request/Validator'
import { Reaction, Reactions, type BlogPost } from './Data/BlogPost'
import { PollValidator } from '@modules/Polls/PollValidator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'

@ErrorConverter()
export class BlogValidator extends Validator {
	private readonly pollValidator: PollValidator

	public constructor() {
		super()
		this.pollValidator = new PollValidator()
	}

	private readonly tagsScheme = z
		.array(
			z
				.string()
				.min(1, 'Тег должен содержать хотя бы один символ')
				.max(255, 'Тег слишком длинный')
				.regex(
					/^[a-zA-Z0-9а-яА-ЯёЁ]+$/,
					'Тег должен содержать только буквы и цифры'
				)
		)
		.min(1, 'У поста должен быть хотя бы один тег')
		.max(10, 'У поста может быть максимум 10 тегов')

	private readonly titleScheme = z
		.string()
		.min(1, 'У поста должно быть название')
		.max(255, 'Название поста слишком длинное, максимум 255 символов')

	private readonly reactionsEnumScheme = z.enum(
		Reactions as [string, ...string[]]
	)

	public parseCreateBlog(data: unknown): BlogPost {
		const scheme = z.object({
			title: this.titleScheme,
			content: z.any(),
			tags: this.tagsScheme,
			poll: this.pollValidator.pollScheme.optional(),
		})

		return scheme.parse(data) as BlogPost
	}

	public parseUpdateBlog(
		data: unknown
	): Partial<BlogPost> & { id: BlogPost['id'] } {
		const scheme = z.object({
			id: z.string().ulid(),
			title: this.titleScheme.optional(),
			content: z.any().optional(),
			tags: this.tagsScheme.optional(),
		})

		return scheme.parse(data)
	}

	public parseReaction(data: unknown): Reaction {
		return this.reactionsEnumScheme.parse(data) as Reaction
	}
}
