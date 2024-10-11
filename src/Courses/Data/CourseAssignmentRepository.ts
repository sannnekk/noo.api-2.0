import { Repository } from '@modules/Core/Data/Repository'
import { CourseAssignment } from './Relations/CourseAssignment'
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel'

export class CourseAssignmentRepository extends Repository<CourseAssignment> {
  constructor() {
    super(CourseAssignmentModel)
  }

  public async deleteFromStudent(studentId: string): Promise<void> {
    await this.queryBuilder('course_assignment')
      .delete()
      .where('course_assignment.studentId = :id', { id: studentId })
      .execute()
  }
}
