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
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	date!: Date

	@Column({
		name: 'url',
		type: 'varchar',
	})
	url!: string

	@Column({
		name: 'visibility',
		type: 'enum',
		enum: [
			'all',
			'own-students',
			'all-mentors',
			'own-mentor',
			'private',
		],
		default: 'private',
	})
	visibility: CalenderEvent['visibility'] = 'private'

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

	@Column({
		name: 'username',
		type: 'varchar',
		nullable: false,
	})
	username!: string
}
