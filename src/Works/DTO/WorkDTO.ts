import { Work } from '../Data/Work'
import { WorkTask } from '../Data/Relations/WorkTask'

export interface WorkDTO {
	id?: Work['id']
	slug?: Work['slug']
	name: Work['name']
	type: Work['type']
	description?: Work['description']
	tasks: {
		id?: WorkTask['id']
		order: WorkTask['order']
		content: WorkTask['content']
		highestScore: WorkTask['highestScore']
		type: WorkTask['type']
		rightAnswer?: WorkTask['rightAnswer']
		solveHint?: WorkTask['solveHint']
		checkHint?: WorkTask['checkHint']
		checkingStrategy?: WorkTask['checkingStrategy']
	}[]
}
