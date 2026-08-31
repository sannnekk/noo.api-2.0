import { Repository } from '../../Core/Data/Repository.js';
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel.js';
export class CourseAssignmentRepository extends Repository {
    constructor() {
        super(CourseAssignmentModel);
    }
    async deleteFromStudent(studentId) {
        await this.queryBuilder('course_assignment')
            .delete()
            .where('course_assignment.studentId = :id', { id: studentId })
            .execute();
    }
    /**
     * Delete all assignments of a course that were created automatically
     * because the course is public (they have no assigner)
     *
     * @param courseId The course to remove the automatic assignments from
     */
    async deleteAutomaticFromCourse(courseId) {
        await this.queryBuilder('course_assignment')
            .delete()
            .where('course_assignment.courseId = :id', { id: courseId })
            .andWhere('course_assignment.assignerId IS NULL')
            .execute();
    }
}
