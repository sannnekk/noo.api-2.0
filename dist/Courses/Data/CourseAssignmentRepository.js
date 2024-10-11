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
}
