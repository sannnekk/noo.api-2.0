import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { Media } from '@modules/Media/Data/Media'
import { CourseChapter } from './Relations/CourseChapter'

export interface Course extends BaseModel {
  slug: string
  name: string
  images: Media[]
  author: User
  authorId: User['id']
  students?: User[]
  studentIds?: User['id'][]
  description: string
  chapters?: CourseChapter[]
}
