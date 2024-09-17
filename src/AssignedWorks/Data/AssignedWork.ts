import { type BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { Work } from '@modules/Works/Data/Work'
import { AssignedWorkComment } from './Relations/AssignedWorkComment'
import { AssignedWorkAnswer } from './Relations/AssignedWorkAnswer'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'

export interface AssignedWork extends BaseModel {
  slug: string
  mentorIds: User['id'][]
  mentors?: User[]
  studentId: User['id']
  student?: User
  workId: Work['id']
  work: Work
  solveStatus:
    | 'not-started'
    | 'in-progress'
    | 'made-in-deadline'
    | 'made-after-deadline'
  checkStatus:
    | 'not-checked'
    | 'in-progress'
    | 'checked-in-deadline'
    | 'checked-after-deadline'
    | 'checked-automatically'
  solveDeadlineAt?: Date
  solveDeadlineShifted: boolean
  checkDeadlineAt?: Date
  checkDeadlineShifted: boolean
  solvedAt: Date | null
  checkedAt: Date | null
  score: number | null
  maxScore: number
  isArchivedByMentors: boolean
  isArchivedByStudent: boolean
  isNewAttempt: boolean
  excludedTaskIds: string[]
  studentComment: DeltaContentType | null
  mentorComment: DeltaContentType | null
  answers: AssignedWorkAnswer[]
  comments: AssignedWorkComment[]
}
