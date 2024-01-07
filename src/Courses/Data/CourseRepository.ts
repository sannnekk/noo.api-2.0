import { Repository } from '@core'
import { CourseModel } from './CourseModel'
import { Course } from './Course'

export class CourseRepository extends Repository<Course> {
	constructor() {
		super(CourseModel)
	}
}
