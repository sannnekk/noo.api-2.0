import { Model } from '@modules/Core/Data/Model'
import { User } from '../User'
import { Subject } from '@modules/Subjects/Data/Subject'
import { MentorAssignment } from './MentorAssignment'
import { Entity, ManyToOne } from 'typeorm'
import { UserModel } from '../UserModel'
import { SubjectModel } from '@modules/Subjects/Data/SubjectModel'

@Entity('mentor_assignment')
export class MentorAssignmentModel extends Model implements MentorAssignment {
  public constructor(data?: Partial<MentorAssignment>) {
    super()

    if (data) {
      if (data.mentor) {
        this.mentor = new UserModel(data.mentor)
      }

      if (data.student) {
        this.student = new UserModel(data.student)
      }

      if (data.subject) {
        this.subject = new SubjectModel(data.subject)
      }
    }
  }

  @ManyToOne(() => UserModel, (user) => user.mentorAssignmentsAsMentor)
  mentor!: User

  @ManyToOne(() => UserModel, (user) => user.mentorAssignmentsAsStudent)
  student!: User

  @ManyToOne(() => SubjectModel, (subject) => subject.mentorAssignments)
  subject!: Subject
}
