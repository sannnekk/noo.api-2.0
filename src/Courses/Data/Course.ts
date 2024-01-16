import { BaseModel } from '@core'
import { User } from '@modules/Users/Data/User'
import { CourseChapter } from './Relations/CourseChapter'

export interface Course extends BaseModel {
	slug: string
	name: string
	// image: Media
	author: User
	authorId: User['id']
	students?: User[]
	studentIds?: User['id'][]
	description: string
	chapters?: CourseChapter[]
}
