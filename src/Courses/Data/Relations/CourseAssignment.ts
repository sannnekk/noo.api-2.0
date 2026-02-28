import type { BaseModel } from '@modules/Core/Data/Model'
import { Course } from '../Course'
import { User } from '@modules/Users/Data/User'

export interface CourseAssignment extends BaseModel {
  course?: Course
  courseId: Course['id']
  student?: User
  studentId: User['id']
  assigner?: User
  assignerId: User['id']
  isArchived: boolean
  isPinned: boolean
}
