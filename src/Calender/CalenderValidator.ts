import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { EventCreationOptions } from './DTO/EventCreationOptions'

@ErrorConverter()
export class CalenderValidator extends Validator {
	public readonly eventVisibilityScheme = z.enum([
		'all',
		'own-students',
		'all-mentors',
		'own-mentor',
		'private',
	])

	public readonly eventCreationScheme = z.object({
		title: z
			.string()
			.min(1, 'Название события не должно быть пустым')
			.max(255, 'Название события не должно превышать 255 символов'),
		description: z.string().optional(),
		date: z.date(),
		visibility: this.eventVisibilityScheme,
	})

	public parseEventCreation(event: unknown): EventCreationOptions {
		return this.parse<EventCreationOptions>(event, this.eventCreationScheme)
	}
}
