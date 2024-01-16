import { Validator } from '@core'
import { Work } from './Data/Work'
import { z } from 'zod'

export class WorkValidator extends Validator {
	public validateCreation(data: unknown): asserts data is Work {
		const schema = z.object({
			name: z.string().min(1).max(100),
			description: z.string(),
			tasks: z.array(
				z.object({
					content: z.any(),
					highestScore: z.number().int().positive(),
					type: z.enum([
						'text',
						'one_choice',
						'multiple_choice',
						'word',
					]),
					rightAnswer: z.string().optional(),
					options: z
						.array(
							z.object({
								name: z.string(),
								isCorrect: z.boolean(),
							})
						)
						.optional(),
				})
			),
		})

		schema.parse(data)
	}

	public validateUpdate(data: unknown): asserts data is Work {
		const schema = z.object({
			id: z.string().ulid(),
			name: z.string().min(1).max(100).optional(),
			description: z.string().optional(),
			tasks: z
				.array(
					z.object({
						id: z.string().ulid().optional(),
						name: z.string().optional(),
						content: z.any().optional(),
						type: z
							.enum(['text', 'one_choice', 'multiple_choice', 'word'])
							.optional(),
						rightAnswer: z.string().optional().nullable(),
						options: z
							.array(
								z.object({
									id: z.string().ulid().optional(),
									name: z.string().optional(),
									isCorrect: z.boolean().optional(),
								})
							)
							.optional(),
						highestScore: z.number().int().positive().optional(),
					})
				)
				.optional(),
		})

		schema.parse(data)
	}
}
