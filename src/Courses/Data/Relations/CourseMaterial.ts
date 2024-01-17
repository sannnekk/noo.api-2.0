import { DeltaContentType, ULID } from '@core'
import { CourseChapter } from './CourseChapter'
import { Work } from '@modules/Works/Data/Work'

export interface CourseMaterial {
	id: ULID.Ulid
	slug: string
	name: string
	description: string
	content: DeltaContentType
	order: number
	chapterId: string
	chapter?: CourseChapter
	work?: Work
	workId?: string
	createdAt: Date
	updatedAt: Date
}
