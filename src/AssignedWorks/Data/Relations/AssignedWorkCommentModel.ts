import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { AssignedWorkComment } from './AssignedWorkComment'
import { AssignedWorkModel } from '../AssignedWorkModel'
import { AssignedWork } from '../AssignedWork'

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
  @JoinColumn({
    name: 'assignedWorkId',
    referencedColumnName: 'id',
  })
  assignedWork?: AssignedWork | undefined

  @Column({
    name: 'assignedWorkId',
    type: 'varchar',
    nullable: true,
  })
  assignedWorkId?: AssignedWorkModel['id']

  private sluggify(): string {
    return ULID.generate()
  }
}
