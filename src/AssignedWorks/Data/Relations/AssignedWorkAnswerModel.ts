import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { AssignedWorkAnswer } from './AssignedWorkAnswer'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	RelationId,
} from 'typeorm'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { AssignedWork } from '../AssignedWork'
import { AssignedWorkModel } from '../AssignedWorkModel'

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
	})
	word?: string | undefined

	@ManyToOne(() => WorkTaskModel, (task) => task.assignedWorkAnswers)
	task?: WorkTask | undefined

	@RelationId((answer: AssignedWorkAnswerModel) => answer.task)
	taskId!: WorkTask['id']

	@ManyToOne(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.answers
	)
	assignedWork?: AssignedWork | undefined

	@RelationId((answer: AssignedWorkAnswerModel) => answer.assignedWork)
	assignedWorkId?: AssignedWorkModel['id']

	public sluggify(): string {
		return ULID.generate()
	}
}
