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
      .andWhere('awc.score > 0')
      .groupBy('work_task.id')
      .orderBy('avgScore', 'ASC')
      .limit(count)
      .getRawMany()
  }
}
