import type { BaseModel } from '@modules/Core/Data/Model'
import type { User } from '@modules/Users/Data/User'
import type { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import type { AssignedWorkAnswer } from './AssignedWorkAnswer'
import type { AssignedWorkComment } from './AssignedWorkComment'

export interface FavouriteTask extends BaseModel {
  user?: User
  task?: WorkTask
  answer: AssignedWorkAnswer | null
  comment: AssignedWorkComment | null
}
