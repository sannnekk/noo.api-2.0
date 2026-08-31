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

  /**
   * Delete all assignments of a course that were created automatically
   * because the course is public (they have no assigner)
   *
   * @param courseId The course to remove the automatic assignments from
   */
  public async deleteAutomaticFromCourse(courseId: string): Promise<void> {
    await this.queryBuilder('course_assignment')
      .delete()
      .where('course_assignment.courseId = :id', { id: courseId })
      .andWhere('course_assignment.assignerId IS NULL')
      .execute()
  }
}
