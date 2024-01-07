import { DeltaContentType, Model, ULID } from '@core'
import { AssignedWorkAnswer } from './AssignedWorkAnswer'
import { WorkTask } from '@modules/Works/Data/Relations/WorkTask'
import { WorkTaskOption } from '@modules/Works/Data/Relations/WorkTaskOption'
import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	RelationId,
} from 'typeorm'
import { WorkTaskOptionModel } from '@modules/Works/Data/Relations/WorkTaskOptionModel'
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

			this.chosenTaskOptions = (data.chosenTaskOptions || []).map(
				(option) => new WorkTaskOptionModel(option)
			)
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

	@ManyToMany(
		() => WorkTaskOptionModel,
		(option) => option.assignedWorkAnswers,
		{ eager: true }
	)
	chosenTaskOptions?: WorkTaskOption[] | undefined

	get chosenTaskOptionIds(): string[] | undefined {
		return (this.chosenTaskOptions || []).map((option) => option.id)
	}

	@ManyToOne(() => WorkTaskModel, (task) => task.assignedWorkAnswers, {
		eager: true,
	})
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
