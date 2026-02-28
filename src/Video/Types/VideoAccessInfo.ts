import { User } from '@modules/Users/Data/User'
import { Video } from '../Data/Video'
import { Course } from '@modules/Courses/Data/Course'

export interface VideoAccessInfo {
  type: Video['accessType']
  text: string
  link?: string
  user?: User
  courses?: Course[]
}
