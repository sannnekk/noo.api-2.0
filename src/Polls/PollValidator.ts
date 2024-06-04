import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { Poll } from './Data/Poll'
import { PollAnswer } from './Data/Relations/PollAnswer'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { UserRoles } from '@modules/Core/Security/roles'

@ErrorConverter()
export class PollValidator extends Validator {
	public readonly visibilityOptionsScheme = z.enum([
		'everyone',
		...Object.keys(UserRoles),
	] as [string, ...string[]])

	public readonly questionTypeSceme = z.enum([
		'text',
		'date',
		'rating',
		'file',
		'choice',
		'number',
	])

	public readonly questionScheme = z.object({
		text: z.string(),
		description: z.string().optional(),
		type: this.questionTypeSceme,
		required: z.boolean(),

		// choice
		choices: z.array(z.string()).optional(),
		minChoices: z.number().min(0).max(99).optional(),
		maxChoices: z.number().min(1).max(99).optional(),

		// rating
		minRating: z.number().optional(),
		maxRating: z.number().optional(),
		onlyIntegerRating: z.boolean().optional(),

		// file
		maxFileSize: z.number().min(1).max(50).optional(),
		maxFileCount: z.number().min(1).max(10).optional(),
		allowedFileTypes: z
			.array(z.enum(['image/jpeg', 'image/png', 'application/pdf']))
			.optional(),

		// text
		minLength: z.number().min(0).max(999).optional(),
		maxLength: z.number().min(1).max(9999).optional(),

		// number
		minValue: z.number().optional(),
		maxValue: z.number().optional(),
		onlyIntegerValue: z.boolean().optional(),

		// date
		onlyFutureDate: z.boolean().optional(),
		onlyPastDate: z.boolean().optional(),
	})

	public readonly pollScheme = z.object({
		title: z.string(),
		description: z.string().optional(),
		requireAuth: z.boolean(),
		stopAt: z.date(),
		isStopped: z.boolean(),
		canSeeResults: z.array(this.visibilityOptionsScheme),
		canVote: z.array(this.visibilityOptionsScheme),
		questions: z.array(this.questionScheme),
	})

	public readonly pollAnswerScheme = z.object({
		id: z.string().ulid().optional(),
		questionId: z.string().ulid(),
		questionType: this.questionTypeSceme,
		text: z.string().optional(),
		number: z.number().optional(),
		date: z.date().optional(),
		files: z.array(z.any()).optional(),
		choices: z.array(z.string()).optional(),
		rating: z.number().optional(),
	})

	public parsePoll(data: unknown): Poll {
		return this.parse<Poll>(data, this.pollScheme)
	}

	public parsePollAnswers(data: unknown): PollAnswer[] {
		return this.parse<PollAnswer[]>(data, z.array(this.pollAnswerScheme))
	}

	public parsePollAnswer(data: unknown): PollAnswer {
		return this.parse(data, this.pollAnswerScheme)
	}
}
