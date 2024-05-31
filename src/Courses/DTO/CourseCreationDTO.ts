import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Media } from '@modules/Media/Data/Media'

export interface CourseCreationDTO {
	slug?: string
	name: string
	description: string
	chapters: CourseChapterCreationDTO[]
	images: Media[]
}

export interface CourseChapterCreationDTO {
	slug?: string
	name: string
	order: number
	materials: CourseMaterialCreationDTO[]
}

export interface CourseMaterialCreationDTO {
	slug?: string
	name: string
	order: number
	description: string
	content: DeltaContentType
}
