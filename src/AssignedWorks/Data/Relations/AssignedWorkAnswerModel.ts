import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { AssignedWorkAnswer } from './AssignedWorkAnswer'
import { AssignedWork } from '../AssignedWork'
import { AssignedWorkModel } from '../AssignedWorkModel'
import { config } from '@modules/config'

@Entity('assigned_work_answer')
export class AssignedWorkAnswerModel
  extends Model
  implements AssignedWorkAnswer
{
  constructor(data?: Partial<AssignedWorkAnswer>) {
    super()

    if (data) {
      this.set(data)

      if (!data.slug) {
        this.slug = this.sluggify()
      }

      if (data.taskId) {
        this.task = { id: data.taskId } as any
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
    name: 'content',
    type: 'json',
    nullable: true,
  })
  content?: DeltaContentType | undefined

  @Column({
    name: 'word',
    type: 'varchar',
    nullable: true,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  word?: string | undefined

  @Column({
    name: 'is_submitted',
    type: 'boolean',
    nullable: true,
    default: false,
  })
  isSubmitted?: boolean | null

  @ManyToOne(() => WorkTaskModel, (task) => task.assignedWorkAnswers)
  task?: WorkTask | undefined

  @RelationId((answer: AssignedWorkAnswerModel) => answer.task)
  taskId!: WorkTask['id']

  @ManyToOne(() => AssignedWorkModel, (assignedWork) => assignedWork.answers, {
    orphanedRowAction: 'delete',
  })
  assignedWork?: AssignedWork | undefined

  public sluggify(): string {
    return ULID.generate()
  }
}
