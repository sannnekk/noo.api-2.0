import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { Media } from '@modules/Media/Data/Media'
import { CourseChapter } from './Relations/CourseChapter'
import { Subject } from '@modules/Subjects/Data/Subject'
import { CourseAssignment } from './Relations/CourseAssignment'

export interface Course extends BaseModel {
  slug: string
  name: string
  images: Media[]
  author: User
  authorId: User['id']
  description: string
  chapters?: CourseChapter[]
  subject: Subject
  subjectId: Subject['id']
  studentAssignments?: CourseAssignment[]
  studentAssignmentIds?: CourseAssignment['id'][]
  studentCount?: number
}
