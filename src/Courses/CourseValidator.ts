import { Validator } from '@core'
import { z } from 'zod'
import { Course } from './Data/Course'

export class CourseValidator extends Validator {
	public validateCreation(course: unknown): asserts course is Course {
		const schema = z.object({
			name: z.string().min(3).max(255),
			description: z.string().max(255).optional(),
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

	public validateStudentIds(
		body: unknown
	): asserts body is { studentIds: string[] } {
		const schema = z.object({
			studentIds: z.array(z.string().ulid()),
		})

		schema.parse(body)
	}

	public validateAssignWork(data: unknown): asserts data is {
		checkDeadline: Date | undefined
		solveDeadline: Date | undefined
	} {
		const schema = z.object({
			checkDeadline: z.date().optional(),
			solveDeadline: z.date().optional(),
		})

		schema.parse(data)
	}
}
