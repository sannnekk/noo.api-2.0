import { ErrorConverter, Validator } from '@core'
import { CalenderEvent } from './Data/CalenderEvent'
import { z } from 'zod'

@ErrorConverter()
export class CalenderValidator extends Validator {
	public validateEventCreation(
		event: unknown
	): asserts event is CalenderEvent {
		const schema = z.object({
			title: z.string(),
			description: z.string(),
			date: z.date(),
			url: z.string().url().optional(),
			isPrivate: z.boolean(),
			type: z.enum([
				'student-deadline',
				'teacher-deadline',
				'work-checked',
				'work-made',
				'event',
			]),
		})

		schema.parse(event)
	}
}
