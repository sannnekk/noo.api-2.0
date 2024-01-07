import { DeltaContentType, type BaseModel } from '@core'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'

export interface AssignedWorkComment extends BaseModel {
	slug: string
	content: DeltaContentType
	score: number
	task?: WorkTask
	taskId: WorkTask['id']
}
