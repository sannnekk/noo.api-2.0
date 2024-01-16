import { Repository } from '@core'
import { CourseMaterialModel } from './Relations/CourseMaterialModel'
import { CourseMaterial } from './Relations/CourseMaterial'

export class CourseMaterialRepository extends Repository<CourseMaterial> {
	constructor() {
		super(CourseMaterialModel)
	}
}
