import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { BaseModel } from '@modules/Core/Data/Model'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { AssignedWork } from '../AssignedWork'

export interface DetailedScore {
  [key: string]: number
}

export interface AssignedWorkComment extends BaseModel {
  slug: string
  content: DeltaContentType
  score: number
  detailedScore: DetailedScore | null
  task?: WorkTask
  taskId: WorkTask['id']
  assignedWork?: AssignedWork
}
