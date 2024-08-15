import { UserRoleType } from '@modules/Core/Security/roles'
import { BaseModel } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Course } from '@modules/Courses/Data/Course'
import { Poll } from '@modules/Polls/Data/Poll'
import { Session } from '@modules/Sessions/Data/Session'
import { UserAvatar } from './Relations/UserAvatar'
import { MentorAssignment } from './Relations/MentorAssignment'
import { Snippet } from '@modules/Snippets/Data/Snippet'

export interface User extends BaseModel {
  slug: string
  role: UserRoleType
  name: string
  username: string
  email: string
  newEmail?: string
  avatar: UserAvatar | null
  mentorAssignmentsAsMentor?: MentorAssignment[]
  mentorAssignmentsAsStudent?: MentorAssignment[]
  telegramUsername?: string
  telegramId?: string
  password?: string
  isBlocked: boolean
  forbidden?: number
  courses?: Course[]
  courseIds: ULID.Ulid[]
  verificationToken: string | null
  coursesAsStudent?: Course[]
  assignedWorksAsStudent?: AssignedWork[] | undefined
  assignedWorksAsMentor?: AssignedWork[] | undefined
  votedPolls?: Poll[]
  sessions?: Session[]
  snippets?: Snippet[]
}
