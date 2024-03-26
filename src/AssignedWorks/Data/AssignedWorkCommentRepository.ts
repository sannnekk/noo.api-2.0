import { Repository } from '@modules/Core/Data/Repository'
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel'
import { AssignedWorkComment } from './Relations/AssignedWorkComment'

export class AssignedWorkCommentRepository extends Repository<AssignedWorkComment> {
	constructor() {
		super(AssignedWorkCommentModel)
	}
}
