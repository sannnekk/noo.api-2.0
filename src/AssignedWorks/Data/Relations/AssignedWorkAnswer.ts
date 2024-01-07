import { BaseModel, DeltaContentType } from '@core'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { WorkTaskOption } from '@modules/Works/Data/Relations/WorkTaskOption'

export interface AssignedWorkAnswer extends BaseModel {
	slug: string
	content?: DeltaContentType
	word?: string
	chosenTaskOptions?: WorkTaskOption[]
	chosenTaskOptionIds?: WorkTaskOption['id'][]
	task?: WorkTask
	taskId: WorkTask['id']
}
