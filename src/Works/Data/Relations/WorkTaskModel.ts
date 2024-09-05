import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { AssignedWorkAnswer } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswer'
import { AssignedWorkAnswerModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswerModel'
import { AssignedWorkComment } from '@modules/AssignedWorks/Data/Relations/AssignedWorkComment'
import { AssignedWorkCommentModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkCommentModel'
import { WorkModel } from '../WorkModel'
import { Work } from '../Work'
import { WorkTask } from './WorkTask'
import { config } from '@modules/config'

@Entity('work_task', {
  orderBy: {
    order: 'ASC',
  },
})
export class WorkTaskModel extends Model implements WorkTask {
  constructor(data?: Partial<WorkTask>) {
    super()

    if (data) {
      this.set(data)

      if (!data.slug) {
        this.slug = this.sluggify()
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

  @Column({
    name: 'order',
    type: 'int',
  })
  order!: number

  @Column({
    name: 'content',
    type: 'json',
  })
  content!: DeltaContentType

  @Column({
    name: 'highest_score',
    type: 'int',
  })
  highestScore!: number

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['text', 'one_choice', 'multiple_choice', 'word'],
    default: 'text',
  })
  type!: 'text' | 'one_choice' | 'multiple_choice' | 'word'

  @ManyToOne(() => WorkModel, (work) => work.tasks, {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  work?: Work | undefined

  @RelationId((task: WorkTaskModel) => task.work)
  workId!: Work['id']

  @Column({
    name: 'right_answer',
    type: 'varchar',
    nullable: true,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  rightAnswer?: string | undefined

  @Column({
    name: 'solve_hint',
    type: 'json',
    nullable: true,
  })
  solveHint?: DeltaContentType | undefined

  @Column({
    name: 'check_hint',
    type: 'json',
    nullable: true,
  })
  checkHint?: DeltaContentType | undefined

  @Column({
    name: 'checking_strategy',
    type: 'enum',
    enum: ['type1', 'type2', 'type3', 'type4'],
    nullable: true,
  })
  checkingStrategy?: 'type1' | 'type2' | 'type3' | 'type4' | undefined

  @Column({
    name: 'is_answer_visible_before_check',
    type: 'boolean',
    default: false,
  })
  isAnswerVisibleBeforeCheck!: boolean

  @OneToMany(() => AssignedWorkAnswerModel, (answer) => answer.task)
  assignedWorkAnswers?: AssignedWorkAnswer[] | undefined

  @OneToMany(() => AssignedWorkCommentModel, (comment) => comment.task)
  assignedWorkComments?: AssignedWorkComment[] | undefined

  private sluggify(): string {
    return ULID.generate()
  }
}
