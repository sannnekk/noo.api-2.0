import { Repository } from '../../Core/Data/Repository.js';
import { MentorAssignmentModel } from './Relations/MentorAssignmentModel.js';
export class MentorAssignmentRepository extends Repository {
    constructor() {
        super(MentorAssignmentModel);
    }
    async deleteFromStudent(studentId) {
        await this.queryBuilder('mentor_assignment')
            .delete()
            .where('mentor_assignment.studentId = :id', { id: studentId })
            .execute();
    }
}
