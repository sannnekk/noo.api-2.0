import { Repository } from '@modules/Core/Data/Repository'
import { CourseModel } from './CourseModel'
import { Course } from './Course'

export class CourseRepository extends Repository<Course> {
  constructor() {
    super(CourseModel)
  }
}
