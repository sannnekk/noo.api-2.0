import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { AssignedWorkComment } from './AssignedWorkComment'
import { AssignedWorkModel } from '../AssignedWorkModel'
import { AssignedWork } from '../AssignedWork'
import { config } from '@modules/config'

@Entity('assigned_work_comment')
export class AssignedWorkCommentModel
  extends Model
  implements AssignedWorkComment
{
  constructor(data?: Partial<AssignedWorkComment>) {
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
  })
  content!: DeltaContentType

  @Column({
    name: 'score',
    type: 'float',
  })
  score!: number

  @ManyToOne(() => WorkTaskModel, (task) => task.assignedWorkComments)
  task?: WorkTask | undefined

  @RelationId((comment: AssignedWorkCommentModel) => comment.task)
  taskId!: AssignedWork['id']

  @ManyToOne(() => AssignedWorkModel, (assignedWork) => assignedWork.comments)
  assignedWork?: AssignedWork | undefined

  private sluggify(): string {
    return ULID.generate()
  }
}
