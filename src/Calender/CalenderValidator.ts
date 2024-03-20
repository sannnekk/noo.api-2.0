import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { CalenderEvent } from './Data/CalenderEvent'
import { z } from 'zod'

@ErrorConverter()
export class CalenderValidator extends Validator {
	public validateEventCreation(
		event: unknown
	): asserts event is CalenderEvent {
		const schema = z.object({
			title: z.string(),
			description: z.string().optional(),
			date: z.date(),
			url: z.string().url().optional(),
			visibility: z.enum([
				'all',
				'own-students',
				'all-mentors',
				'own-mentor',
				'private',
			]),
			type: z.enum([
				'student-deadline',
				'mentor-deadline',
				'work-checked',
				'work-made',
				'event',
			]),
		})

		schema.parse(event)
	}
}
