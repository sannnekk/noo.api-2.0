import { Repository } from '@modules/Core/Data/Repository'
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel'
import { AssignedWorkAnswer } from './Relations/AssignedWorkAnswer'

export class AssignedWorkAnswerRepository extends Repository<AssignedWorkAnswer> {
	constructor() {
		super(AssignedWorkAnswerModel)
	}
}
