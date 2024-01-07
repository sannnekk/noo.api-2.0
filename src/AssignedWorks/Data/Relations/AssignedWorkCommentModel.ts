import { DeltaContentType, Model, ULID } from '@core'
import { AssignedWorkComment } from './AssignedWorkComment'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
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

	@ManyToOne(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.comments
	)
	assignedWork?: AssignedWork | undefined

	@RelationId(
		(comment: AssignedWorkCommentModel) => comment.assignedWork
	)
	assignedWorkId?: AssignedWork['id']

	private sluggify(): string {
		return ULID.generate()
	}
}
