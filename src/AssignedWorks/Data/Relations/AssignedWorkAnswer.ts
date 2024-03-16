import { BaseModel, DeltaContentType } from '@core'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'

export interface AssignedWorkAnswer extends BaseModel {
	slug: string
	content?: DeltaContentType
	word?: string
	task?: WorkTask
	taskId: WorkTask['id']
}
