import { BaseModel } from '@core'
import { User } from '@modules/Users/Data/User'

export interface CalenderEvent extends BaseModel {
	title: string
	description: string
	date: Date
	url: string
	isPrivate: boolean
	type:
		| 'student-deadline'
		| 'mentor-deadline'
		| 'work-checked'
		| 'work-made'
		| 'event'
	username: User['username']
}
