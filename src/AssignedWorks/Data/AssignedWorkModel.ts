import * as ULID from '@modules/Core/Data/Ulid'
import { User } from '@modules/Users/Data/User'
import { Work } from '@modules/Works/Data/Work'
import {
  Brackets,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import { UserModel } from '@modules/Users/Data/UserModel'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { CalenderEventModel } from '@modules/Calender/Data/CalenderEventModel'
import { AssignedWorkAnswer } from './Relations/AssignedWorkAnswer'
import { AssignedWorkComment } from './Relations/AssignedWorkComment'
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel'
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel'
import { AssignedWork } from './AssignedWork'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { config } from '@modules/config'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'

@Entity('assigned_work')
export class AssignedWorkModel extends SearchableModel implements AssignedWork {
  constructor(data?: Partial<AssignedWork>) {
    super()

    if (data) {
      this.set(data)

      if (!data.slug) {
        this.slug = this.sluggify()
      }

      if (data.mentors) {
        this.mentors = data.mentors.map((mentor) => new UserModel(mentor))
      }

      if (data.answers) {
        this.answers = data.answers.map(
          (answer) => new AssignedWorkAnswerModel(answer)
        )
      }

      if (data.comments) {
        this.comments = data.comments.map(
          (comment) => new AssignedWorkCommentModel(comment)
        )
      }
    }
  }

  @Column({
    name: 'slug',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  slug!: string

  @ManyToMany(() => UserModel, (user) => user.assignedWorksAsMentor, {
    eager: true,
    cascade: true,
  })
  @JoinTable()
  mentors?: User[] | undefined

  @RelationId((assignedWork: AssignedWorkModel) => assignedWork.mentors)
  mentorIds!: string[]

  @ManyToOne(() => UserModel, (user) => user.assignedWorksAsStudent)
  student!: User | undefined

  @RelationId((assignedWork: AssignedWorkModel) => assignedWork.student)
  studentId!: User['id']

  @ManyToOne(() => WorkModel, (work) => work.assignedWorks)
  work!: Work

  @RelationId((assignedWork: AssignedWorkModel) => assignedWork.work)
  workId!: Work['id']

  @Column({
    name: 'solve_status',
    type: 'enum',
    enum: [
      'not-started',
      'in-progress',
      'made-in-deadline',
      'made-after-deadline',
    ],
    default: 'not-started',
  })
  solveStatus!:
    | 'not-started'
    | 'in-progress'
    | 'made-in-deadline'
    | 'made-after-deadline'

  @Column({
    name: 'check_status',
    type: 'enum',
    enum: [
      'not-checked',
      'in-progress',
      'checked-in-deadline',
      'checked-after-deadline',
      'checked-automatically',
    ],
    default: 'not-checked',
  })
  checkStatus!:
    | 'not-checked'
    | 'in-progress'
    | 'checked-in-deadline'
    | 'checked-after-deadline'
    | 'checked-automatically'

  @Column({
    name: 'solve_deadline_at',
    type: 'timestamp',
    nullable: true,
  })
  solveDeadlineAt?: Date | undefined

  @Column({
    name: 'solve_deadline_shifted',
    type: 'boolean',
    default: false,
  })
  solveDeadlineShifted!: boolean

  @Column({
    name: 'check_deadline_at',
    type: 'timestamp',
    nullable: true,
  })
  checkDeadlineAt?: Date | undefined

  @Column({
    name: 'check_deadline_shifted',
    type: 'boolean',
    default: false,
  })
  checkDeadlineShifted!: boolean

  @Column({
    name: 'solved_at',
    type: 'timestamp',
    nullable: true,
  })
  solvedAt!: Date | null

  @Column({
    name: 'checked_at',
    type: 'timestamp',
    nullable: true,
  })
  checkedAt!: Date | null

  @OneToMany(() => AssignedWorkAnswerModel, (answer) => answer.assignedWork, {
    cascade: true,
  })
  answers!: AssignedWorkAnswer[]

  @OneToMany(
    () => AssignedWorkCommentModel,
    (comment) => comment.assignedWork,
    { cascade: true }
  )
  comments!: AssignedWorkComment[]

  @OneToMany(
    () => CalenderEventModel,
    (calenderEvent) => calenderEvent.assignedWork
  )
  calenderEvents!: CalenderEventModel[]

  @Column({
    name: 'score',
    type: 'int',
    nullable: true,
  })
  score!: number | null

  @Column({
    name: 'max_score',
    type: 'int',
  })
  maxScore!: number

  @Column({
    name: 'is_archived_by_mentors',
    type: 'boolean',
    default: false,
  })
  isArchivedByMentors!: boolean

  @Column({
    name: 'is_archived_by_student',
    type: 'boolean',
    default: false,
  })
  isArchivedByStudent!: boolean

  @Column({
    name: 'is_new_attempt',
    type: 'boolean',
    default: false,
  })
  isNewAttempt!: boolean

  @Column({
    name: 'student_comment',
    type: 'json',
    nullable: true,
  })
  studentComment!: DeltaContentType | null

  @Column({
    name: 'mentor_comment',
    type: 'json',
    nullable: true,
  })
  mentorComment!: DeltaContentType | null

  @Column({
    name: 'filtered_out_task_ids',
    type: 'json',
    nullable: true,
  })
  _excludedTaskIds?: string

  get excludedTaskIds(): string[] {
    if (this._excludedTaskIds) {
      return JSON.parse(this._excludedTaskIds)
    }

    return []
  }

  set excludedTaskIds(value: string[]) {
    this._excludedTaskIds = JSON.stringify(value)
  }

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(assigned_work__student.name) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
        qb.orWhere('LOWER(assigned_work__work.name) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
        /* qb.orWhere(
          'LOWER(assigned_work__assigned_work_mentors.name) LIKE LOWER(:needle)',
          {
            needle: `%${needle}%`,
          }
        ) */
      })
    )

    return ['student', 'work', 'mentors']
  }

  static readableSolveStatus(status: AssignedWork['solveStatus']): string {
    switch (status) {
      case 'not-started':
        return 'Не начато'
      case 'in-progress':
        return 'В процессе'
      case 'made-in-deadline':
        return 'Сдано в дедлайн'
      case 'made-after-deadline':
        return 'Сдано после дедлайна'
      default:
        return status
    }
  }

  static readableCheckStatus(status: AssignedWork['checkStatus']): string {
    switch (status) {
      case 'not-checked':
        return 'Не проверено'
      case 'in-progress':
        return 'В процессе'
      case 'checked-in-deadline':
        return 'Проверено в дедлайн'
      case 'checked-after-deadline':
        return 'Проверено после дедлайна'
      case 'checked-automatically':
        return 'Проверено автоматически'
      default:
        return status
    }
  }

  private sluggify(): string {
    return ULID.generate()
  }
}
