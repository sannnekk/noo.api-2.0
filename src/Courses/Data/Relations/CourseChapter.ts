import * as ULID from '@modules/Core/Data/Ulid'
import { Course } from '../Course'
import { CourseMaterial } from './CourseMaterial'

export interface CourseChapter {
  id: ULID.Ulid
  name: string
  slug: string
  course?: Course
  chapters?: CourseChapter[]
  materials?: CourseMaterial[]
  materialIds?: string[]
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
