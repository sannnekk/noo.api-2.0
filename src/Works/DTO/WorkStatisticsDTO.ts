import { WorkTask } from '../Data/Relations/WorkTask'
import { Work } from '../Data/Work'

export interface WorkStatisticsDTO {
  hardestTaskIds: { taskId: WorkTask['id']; avgScore: number }[]
  averageWorkScore: {
    absolute: number
    percentage: number
  }
  medianWorkScore: {
    absolute: number
    percentage: number
  }
  workSolveCount: number
  work: Work
}
