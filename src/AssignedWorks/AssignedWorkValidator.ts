import { Validator } from '@core'
import { AssignedWork } from './Data/AssignedWork'
import { z } from 'zod'

export class AssignedWorkValidator extends Validator {
	public validateCreation(data: unknown): asserts data is AssignedWork {
		const schema = z.object({
			studentId: z.string().ulid(),
			workId: z.string().ulid(),
		})

		schema.parse(data)
	}

	public validateUpdate(data: unknown): asserts data is AssignedWork {
		const schema = z.object({
			studentId: z.string().ulid(),
			workId: z.string().ulid(),
			mentorIds: z.array(z.string().ulid()).optional(),
			solveStatus: z
				.enum([
					'not-started',
					'in-progress',
					'made-in-deadline',
					'made-after-deadline',
				])
				.optional(),
			checkStatus: z
				.enum([
					'not-checked',
					'in-progress',
					'checked-in-deadline',
					'checked-after-deadline',
				])
				.optional(),
			solveDeadlineAt: z.date().optional(),
			checkDeadlineAt: z.date().optional(),
			solvedAt: z.date().optional(),
			checkedAt: z.date().optional(),
			score: z.number().optional(),
		})

		schema.parse(data)
	}
}
