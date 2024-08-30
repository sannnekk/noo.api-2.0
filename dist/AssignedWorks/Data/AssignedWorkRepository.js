import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
    async findWorkIdsByStudentAndSubject(studentId, subjectId) {
        const assignedWorks = await this.findAll({
            student: { id: studentId },
            work: { subject: { id: subjectId } },
        });
        return assignedWorks.map((assignedWork) => assignedWork.id);
    }
    async removeMentorsFromAssignedWorks(assignedWorkIds) {
        // mentor and assignedWork relation is many to many
        // so we need to remove all mentors from assigned works
        await this.queryBuilder('assigned_work_mentors_user')
            .delete()
            .from('assigned_work_mentors_user')
            .where('assignedWorkId IN (:...assignedWorkIds)', { assignedWorkIds })
            .execute();
    }
    async assignMentorToAssignedWorks(assignedWorkIds, mentorId) {
        // assign new mentor to assigned works
        await this.queryBuilder('assigned_work_mentors_user')
            .insert()
            .into('assigned_work_mentors_user')
            .values(assignedWorkIds.map((assignedWorkId) => ({
            assignedWorkId,
            userId: mentorId,
        })))
            .execute();
    }
}
