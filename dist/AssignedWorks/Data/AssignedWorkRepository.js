import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
import { medianValue } from '../Utils/Math.js';
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
    async getWorkSolveCount(id, includeNewAttempts = true) {
        const qb = this.queryBuilder('assigned_work')
            .select('COUNT(id)', 'count')
            .where('workId = :id', { id })
            .andWhere('solved_at IS NOT NULL');
        if (!includeNewAttempts) {
            qb.andWhere('is_new_attempt = 0');
        }
        const result = await qb.getRawOne();
        return parseInt(result.count);
    }
    async getAverageWorkScore(id) {
        const result = await this.queryBuilder('assigned_work')
            .select('COALESCE(AVG(score), 0)', 'avgScore')
            .where('workId = :id', { id })
            .andWhere('score IS NOT NULL')
            .getRawOne();
        return parseFloat(result.avgScore);
    }
    async getMedianWorkScore(id) {
        const results = (await this.queryBuilder('assigned_work')
            .select('score', 'score')
            .where('workId = :id', { id })
            .andWhere('score IS NOT NULL')
            .getRawMany());
        const scores = results.map((item) => parseFloat(item.score)) || [];
        return medianValue(scores);
    }
    async setSolvingInProgress(assignedWorkId) {
        await this.queryBuilder('assigned_work')
            .update()
            .set({ solveStatus: 'in-progress' })
            .where('id = :assignedWorkId', { assignedWorkId })
            .andWhere('solved_at IS NULL')
            .execute();
    }
    async setCheckInProgress(assignedWorkId) {
        await this.queryBuilder('assigned_work')
            .update()
            .set({ checkStatus: 'in-progress' })
            .where('id = :assignedWorkId', { assignedWorkId })
            .andWhere('solved_at IS NULL')
            .execute();
    }
}
