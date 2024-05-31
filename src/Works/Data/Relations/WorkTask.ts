import { BaseModel } from '@modules/Core/Data/Model'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Work } from '../Work'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkAnswer } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswer'
import { AssignedWorkComment } from '@modules/AssignedWorks/Data/Relations/AssignedWorkComment'

export interface WorkTask extends BaseModel {
	slug: string
	order: number
	content: DeltaContentType
	highestScore: number
	type: 'one_choice' | 'multiple_choice' | 'word' | 'text'
	workId?: Work['id']
	work?: Work
	assignedWorkId?: AssignedWork['id']
	assignedWork?: AssignedWork
	rightAnswer?: string
	solveHint?: DeltaContentType
	checkHint?: DeltaContentType
	checkingStrategy?: 'type1' | 'type2' | 'type3' | 'type4'
	assignedWorkAnswers?: AssignedWorkAnswer[]
	assignedWorkAnswerIds?: AssignedWorkAnswer['id'][]
	assignedWorkComments?: AssignedWorkComment[]
	assignedWorkCommentIds?: AssignedWorkComment['id'][]
}
