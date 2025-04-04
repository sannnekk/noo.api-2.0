import { Repository } from '../../Core/Data/Repository.js';
import { WorkTaskModel } from './Relations/WorkTaskModel.js';
export class WorkTaskRepository extends Repository {
    constructor() {
        super(WorkTaskModel);
    }
    async getHardestTaskIds(workId, count) {
        return this.queryBuilder('work_task')
            .select('work_task.id', 'taskId')
            .addSelect('COALESCE(AVG(awc.score / work_task.highest_score * 100), 0)', 'avgScore')
            .leftJoin('assigned_work_comment', 'awc', 'work_task.id = awc.taskId')
            .where('work_task.workId = :workId', { workId })
            .andWhere('awc.score IS NOT NULL')
            .groupBy('work_task.id')
            .orderBy('avgScore', 'ASC')
            .limit(count)
            .getRawMany();
    }
    async getWorkMaxScore(workId) {
        const result = (await this.queryBuilder('work_task')
            .select('SUM(work_task.highest_score)', 'maxScore')
            .where('workId = :workId', { workId })
            .getRawOne());
        return parseInt(result.maxScore) === 0 ? 1 : parseInt(result.maxScore);
    }
}
