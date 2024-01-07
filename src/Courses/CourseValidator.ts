import { Validator } from '@core'
import { z } from 'zod'
import { Course } from './Data/Course'

export class CourseValidator extends Validator {
	public validateCreation(course: unknown): asserts course is Course {
		const schema = z.object({
			name: z.string().min(3).max(255),
			description: z.string().max(255),
			chapters: z
				.array(
					z.object({
						name: z.string().max(255),
						materials: z
							.array(
								z.object({
									name: z.string().max(255),
									description: z.string().optional(),
									content: z.any().optional(),
								})
							)
							.optional(),
					})
				)
				.optional(),
		})

		schema.parse(course)
	}

	public validateUpdate(course: unknown): asserts course is Course {
		const schema = z.object({
			id: z.string().ulid(),
			name: z.string().min(3).max(255).optional(),
			description: z.string().optional(),
			chapters: z
				.array(
					z.object({
						id: z.string().ulid().optional(),
						name: z.string().max(255).optional(),
						materials: z
							.array(
								z.object({
									id: z.string().ulid().optional(),
									name: z.string().max(255).optional(),
									description: z.string().optional(),
									content: z.any().optional(),
								})
							)
							.optional(),
					})
				)
				.optional(),
		})

		schema.parse(course)
	}
}
