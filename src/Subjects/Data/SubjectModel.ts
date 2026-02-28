import { BaseModel } from '@modules/Core/Data/Model'
import { Subject } from './Subject'
import {
  Brackets,
  Column,
  Entity,
  OneToMany,
  SelectQueryBuilder,
} from 'typeorm'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { Course } from '@modules/Courses/Data/Course'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { UserModel } from '@modules/Users/Data/UserModel'
import { MentorAssignmentModel } from '@modules/Users/Data/Relations/MentorAssignmentModel'
import { config } from '@modules/config'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'

@Entity('subject')
export class SubjectModel extends SearchableModel implements Subject {
  public constructor(data?: Partial<Subject>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  name!: string

  @Column({
    name: 'color',
    type: 'varchar',
    length: 255,
    nullable: false,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  color: string = ''

  @OneToMany(() => CourseModel, (course) => course.subject)
  courses!: Course[]

  @OneToMany(() => WorkModel, (work) => work.subject)
  works!: WorkModel[]

  @OneToMany(
    () => MentorAssignmentModel,
    (mentorAssignment) => mentorAssignment.subject
  )
  mentorAssignments!: UserModel[]

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(subject.name) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
      })
    )

    return []
  }
}
