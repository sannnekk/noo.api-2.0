import { ErrorConverter, Validator } from '@core'
import { Work } from './Data/Work'
import { z } from 'zod'

@ErrorConverter()
export class WorkValidator extends Validator {
	public validateCreation(data: unknown): asserts data is Work {
		const schema = z.object({
			name: z.string().min(1).max(100),
			type: z.enum(['type1', 'type2', 'type3']),
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
					solveHint: z.any().optional(),
					checkHint: z.any().optional(),
					checkingStrategy: z.enum(['type1', 'type2']).optional(),
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
			type: z.enum(['type1', 'type2', 'type3']).optional(),
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
						solveHint: z.any().optional().nullable(),
						checkHint: z.any().optional().nullable(),
						checkingStrategy: z.enum(['type1', 'type2']).optional(),
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
