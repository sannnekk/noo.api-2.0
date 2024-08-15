import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { BaseModel } from '@modules/Core/Data/Model'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { AssignedWork } from '../AssignedWork'

export interface AssignedWorkComment extends BaseModel {
  slug: string
  content: DeltaContentType
  score: number
  task?: WorkTask
  taskId: WorkTask['id']
  assignedWork?: AssignedWork
}
