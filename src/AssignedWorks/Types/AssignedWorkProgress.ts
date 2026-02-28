import { AssignedWork } from '../Data/AssignedWork'

export interface AssignedWorkProgress {
  score: number | null
  maxScore: number
  solveStatus: AssignedWork['solveStatus']
  checkStatus: AssignedWork['checkStatus']
}
