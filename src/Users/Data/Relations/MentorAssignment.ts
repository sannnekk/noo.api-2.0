import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '../User'
import { Subject } from '@modules/Subjects/Data/Subject'

export interface MentorAssignment extends BaseModel {
  mentor: User
  student: User
  subject: Subject
}
