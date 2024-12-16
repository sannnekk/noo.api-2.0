import { WorkTask } from '../Data/Relations/WorkTask'
import { Work } from '../Data/Work'

export interface WorkStatisticsDTO {
  hardestTaskIds: { taskId: WorkTask['id']; avgScore: number }[]
  averageWorkScore: number
  medianWorkScore: number
  workSolveCount: number
  work: Work
}
