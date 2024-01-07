import { BaseModel } from '@core'
import { WorkTask } from './WorkTask'
import { AssignedWorkAnswer } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswer'

export interface WorkTaskOption extends BaseModel {
	name: string
	isCorrect: boolean
	taskId: string
	task?: WorkTask
	assignedWorkAnswers?: AssignedWorkAnswer[]
	assignedWorkAnswerIds?: AssignedWorkAnswer['id'][]
}
