import { AssignedWork } from '../Data/AssignedWork'

export interface SolveOptions {
  answers: AssignedWork['answers']
  studentComment?: AssignedWork['studentComment']
}
