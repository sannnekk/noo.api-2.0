import { type BaseModel } from '@core'
import { User } from '@modules/Users/Data/User'
import { Work } from '@modules/Works/Data/Work'
import { AssignedWorkComment } from './Relations/AssignedWorkComment'
import { AssignedWorkAnswer } from './Relations/AssignedWorkAnswer'

export interface AssignedWork extends BaseModel {
	slug: string
	mentorIds: User['id'][]
	mentors?: User[]
	studentId: User['id']
	student?: User
	workId: Work['id']
	work: Work
	solveStatus:
		| 'not-started'
		| 'in-progress'
		| 'made-in-deadline'
		| 'made-after-deadline'
	checkStatus:
		| 'not-checked'
		| 'in-progress'
		| 'checked-in-deadline'
		| 'checked-after-deadline'
	solveDeadlineAt?: Date
	checkDeadlineAt?: Date
	solvedAt?: Date
	checkedAt?: Date
	answers: AssignedWorkAnswer[]
	answerIds: AssignedWorkAnswer['id'][]
	comments: AssignedWorkComment[]
	commentIds: AssignedWorkComment['id'][]
	score?: number
	maxScore: number
}
