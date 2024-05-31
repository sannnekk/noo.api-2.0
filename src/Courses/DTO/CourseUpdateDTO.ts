import { Media } from '@modules/Media/Data/Media'
import { Course } from '../Data/Course'
import { CourseChapter } from '../Data/Relations/CourseChapter'
import { CourseMaterial } from '../Data/Relations/CourseMaterial'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'

export interface CourseUpdateDTO {
	id: Course['id']
	slug?: string
	name: string
	description: string
	chapters: CourseChapterUpdateDTO[]
	images: Media[]
}

export interface CourseChapterUpdateDTO {
	id: CourseChapter['id']
	slug?: string
	name: string
	order: number
	materials: CourseMaterialUpdateDTO[]
}

export interface CourseMaterialUpdateDTO {
	id: CourseMaterial['id']
	slug?: string
	name: string
	order: number
	description: string
	content: DeltaContentType
}
