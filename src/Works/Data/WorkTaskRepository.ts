import { Repository } from '@modules/Core/Data/Repository'
import { WorkTaskModel } from './Relations/WorkTaskModel'
import type { WorkTask } from './Relations/WorkTask'
import type { Work } from './Work'

export class WorkTaskRepository extends Repository<WorkTask> {
  constructor() {
    super(WorkTaskModel)
  }

  public async getHardestTaskIds(
    workId: Work['id'],
    count: number
  ): Promise<{ taskId: string; avgScore: number }[]> {
    return this.queryBuilder('work_task')
      .select('work_task.id', 'taskId')
      .addSelect(
        'COALESCE(AVG(awc.score / work_task.highest_score * 100), 0)',
        'avgScore'
      )
      .leftJoin('assigned_work_comment', 'awc', 'work_task.id = awc.taskId')
      .where('work_task.workId = :workId', { workId })
      .andWhere('awc.score IS NOT NULL')
      .groupBy('work_task.id')
      .orderBy('avgScore', 'ASC')
      .limit(count)
      .getRawMany()
  }

  public async getWorkMaxScore(workId: Work['id']): Promise<number> {
    const result = (await this.queryBuilder('work_task')
      .select('SUM(work_task.highest_score)', 'maxScore')
      .where('workId = :workId', { workId })
      .getRawOne()) as { maxScore: string }

    return parseInt(result.maxScore) === 0 ? 1 : parseInt(result.maxScore)
  }
}
