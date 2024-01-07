import { Repository } from '@core'
import { WorkModel } from './WorkModel'
import { Work } from './Work'

export class WorkRepository extends Repository<Work> {
	constructor() {
		super(WorkModel)
	}
}
