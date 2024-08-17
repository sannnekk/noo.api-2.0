import { AssignedWork } from '../Data/AssignedWork'

export interface SaveOptions {
  answers: AssignedWork['answers']
  comments?: AssignedWork['comments']
  studentComment?: AssignedWork['studentComment']
  mentorComment?: AssignedWork['mentorComment']
}
