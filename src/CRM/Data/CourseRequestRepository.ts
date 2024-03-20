import { Repository } from '@modules/Core/Data/Repository'
import { CourseRequestModel } from './CourseRequestModel'
import { CourseRequest } from './CourseRequest'

export class CourseRequestRepository extends Repository<CourseRequest> {
	public constructor() {
		super(CourseRequestModel)
	}
}
