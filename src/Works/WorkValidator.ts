import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { Work } from './Data/Work'
import { z } from 'zod'

@ErrorConverter()
export class WorkValidator extends Validator {
	public validateCreation(data: unknown): asserts data is Work {
		const schema = z.object({
			name: z
				.string()
				.min(1, 'Нет названия работы')
				.max(
					100,
					'Название работы слишком длинное, максимум 100 символов разрешено'
				),
			type: z.enum([
				'trial-work',
				'phrase',
				'mini-test',
				'test',
				'second-part',
			]),
			description: z.string().optional(),
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
					checkingStrategy: z
						.enum(['type1', 'type2', 'type3', 'type4'])
						.optional(),
				})
			),
		})

		schema.parse(data)
	}

	public validateUpdate(data: unknown): asserts data is Work {
		const schema = z.object({
			id: z.string().ulid(),
			type: z
				.enum([
					'trial-work',
					'phrase',
					'mini-test',
					'test',
					'second-part',
				])
				.optional(),
			name: z
				.string()
				.min(1, 'Нет названия работы')
				.max(
					100,
					'Название работы слишком длинное, максимум 100 символов разрешено'
				)
				.optional(),
			description: z.string().optional(),
			tasks: z
				.array(
					z.object({
						id: z.string().ulid().optional(),
						content: z.any().optional(),
						type: z
							.enum(['text', 'one_choice', 'multiple_choice', 'word'])
							.optional(),
						rightAnswer: z.string().optional().nullable(),
						solveHint: z.any().optional().nullable(),
						checkHint: z.any().optional().nullable(),
						checkingStrategy: z
							.enum(['type1', 'type2', 'type3', 'type4'])
							.optional(),
						highestScore: z.number().int().positive().optional(),
					})
				)
				.optional(),
		})

		schema.parse(data)
	}
}
