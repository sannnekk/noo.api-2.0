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

@Entity('work_task')
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
  })
  work?: Work | undefined

  @RelationId((task: WorkTaskModel) => task.work)
  workId!: Work['id']

  @Column({
    name: 'right_answer',
    type: 'varchar',
    nullable: true,
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

  @OneToMany(() => AssignedWorkAnswerModel, (answer) => answer.task)
  assignedWorkAnswers?: AssignedWorkAnswer[] | undefined

  @OneToMany(() => AssignedWorkCommentModel, (comment) => comment.task)
  assignedWorkComments?: AssignedWorkComment[] | undefined

  private sluggify(): string {
    return ULID.generate()
  }
}
