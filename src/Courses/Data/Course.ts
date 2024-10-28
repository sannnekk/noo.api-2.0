import type { BaseModel } from '@modules/Core/Data/Model'
import type { User } from '@modules/Users/Data/User'
import type { Media } from '@modules/Media/Data/Media'
import type { CourseChapter } from './Relations/CourseChapter'
import type { Subject } from '@modules/Subjects/Data/Subject'
import type { CourseAssignment } from './Relations/CourseAssignment'

export interface Course extends BaseModel {
  slug: string
  name: string
  images: Media[]
  authors: User[]
  description: string
  chapters?: CourseChapter[]
  subject: Subject
  subjectId: Subject['id']
  studentAssignments?: CourseAssignment[]
  studentAssignmentIds?: CourseAssignment['id'][]
  studentCount?: number
}
