import { Model } from '@core'
import { CalenderEvent } from './CalenderEvent'
import { Column, Entity } from 'typeorm'

@Entity('calender_event')
export class CalenderEventModel extends Model implements CalenderEvent {
	constructor(data?: Partial<CalenderEvent>) {
		super()

		if (data) {
			this.set(data)
		}
	}

	@Column({
		name: 'title',
		type: 'varchar',
	})
	title!: string

	@Column({
		name: 'description',
		type: 'text',
	})
	description!: string

	@Column({
		name: 'date',
		type: 'date',
	})
	date!: Date

	@Column({
		name: 'url',
		type: 'varchar',
	})
	url!: string

	@Column({
		name: 'is_private',
		type: 'boolean',
		default: false,
		nullable: false,
	})
	isPrivate: boolean = false

	@Column({
		name: 'type',
		type: 'enum',
		enum: [
			'student-deadline',
			'mentor-deadline',
			'work-checked',
			'work-made',
			'event',
		],
		default: 'event',
		nullable: false,
	})
	type:
		| 'student-deadline'
		| 'mentor-deadline'
		| 'work-checked'
		| 'work-made'
		| 'event' = 'event'
}
