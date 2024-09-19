import { User } from '../User'
import { Subject } from '@modules/Subjects/Data/Subject'
import { MentorAssignment } from './MentorAssignment'
import { Brackets, Entity, ManyToOne, SelectQueryBuilder } from 'typeorm'
import { UserModel } from '../UserModel'
import { SubjectModel } from '@modules/Subjects/Data/SubjectModel'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'

@Entity('mentor_assignment')
export class MentorAssignmentModel
  extends SearchableModel
  implements MentorAssignment
{
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

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where(
          'LOWER(mentor_assignment__student.username) LIKE LOWER(:needle)',
          {
            needle: `%${needle}%`,
          }
        )
        qb.orWhere(
          'LOWER(mentor_assignment__student.name) LIKE LOWER(:needle)',
          {
            needle: `%${needle}%`,
          }
        )
        qb.orWhere(
          'LOWER(mentor_assignment__student.email) LIKE LOWER(:needle)',
          {
            needle: `%${needle}%`,
          }
        )
        qb.orWhere(
          'LOWER(mentor_assignment__student.telegramUsername) LIKE LOWER(:needle)',
          {
            needle: `%${needle}%`,
          }
        )
      })
    )

    return ['student']
  }
}
