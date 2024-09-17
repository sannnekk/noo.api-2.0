import { Repository } from '@modules/Core/Data/Repository'
import { CourseAssignment } from './Relations/CourseAssignment'
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel'

export class CourseAssignmentRepository extends Repository<CourseAssignment> {
  constructor() {
    super(CourseAssignmentModel)
  }
}
