import { Repository } from '@core'
import { AssignedWork } from './AssignedWork'
import { AssignedWorkModel } from './AssignedWorkModel'

export class AssignedWorkRepository extends Repository<AssignedWork> {
	constructor() {
		super(AssignedWorkModel)
	}
}
