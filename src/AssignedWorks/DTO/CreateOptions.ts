import { User } from '@modules/Users/Data/User'
import { Work } from '@modules/Works/Data/Work'

export interface CreateOptions {
  studentId: User['id']
  workId: Work['id']
  isNewAttempt?: boolean
  solveDeadlineAt?: Date
  checkDeadlineAt?: Date
}
