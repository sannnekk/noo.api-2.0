import { UserRoleType } from '@modules/Core/Security/roles'
import { BaseModel } from '@modules/Core/Data/Model'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Course } from '@modules/Courses/Data/Course'
import { Poll } from '@modules/Polls/Data/Poll'
import { Session } from '@modules/Sessions/Data/Session'
import { UserAvatar } from './Relations/UserAvatar'
import { MentorAssignment } from './Relations/MentorAssignment'
import { Snippet } from '@modules/Snippets/Data/Snippet'
import { CourseAssignment } from '@modules/Courses/Data/Relations/CourseAssignment'

export interface User extends BaseModel {
  slug: string
  role: UserRoleType
  name: string
  username: string
  email: string
  newEmail: string | null
  avatar: UserAvatar | null
  mentorAssignmentsAsMentor?: MentorAssignment[]
  mentorAssignmentsAsStudent?: MentorAssignment[]
  telegramUsername: string | null
  telegramId: string | null
  telegramNotificationsEnabled: boolean
  password?: string
  isBlocked: boolean
  forbidden?: number
  courses?: Course[]
  verificationToken: string | null
  courseAssignments?: CourseAssignment[]
  courseAssignmentsAsAssigner?: CourseAssignment[]
  assignedWorksAsStudent?: AssignedWork[] | undefined
  assignedWorksAsMentor?: AssignedWork[] | undefined
  votedPolls?: Poll[]
  sessions?: Session[]
  snippets?: Snippet[]
}
