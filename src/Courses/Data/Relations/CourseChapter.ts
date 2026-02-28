import * as ULID from '@modules/Core/Data/Ulid'
import { Course } from '../Course'
import { CourseMaterial } from './CourseMaterial'

export interface CourseChapter {
  id: ULID.Ulid
  name: string
  titleColor: string | null
  slug: string
  course?: Course
  parentChapter?: CourseChapter
  chapters?: CourseChapter[]
  materials?: CourseMaterial[]
  materialIds?: string[]
  order: number
  isActive: boolean
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
}
