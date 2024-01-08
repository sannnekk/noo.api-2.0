import { Model } from '@core'
import { WorkTaskOption } from './WorkTaskOption'
import { WorkTask } from './WorkTask'
import {
	Column,
	Entity,
	ManyToMany,
	ManyToOne,
	RelationId,
} from 'typeorm'
import { WorkTaskModel } from './WorkTaskModel'
import { AssignedWorkAnswer } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswer'
import { AssignedWorkAnswerModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswerModel'

@Entity('work_task_option')
export class WorkTaskOptionModel
	extends Model
	implements WorkTaskOption
{
	constructor(data?: Partial<WorkTaskOption>) {
		super()

		if (data) {
			this.set(data)

			this.assignedWorkAnswers = (data.assignedWorkAnswers || []).map(
				(answer) => new AssignedWorkAnswerModel(answer)
			)
		}
	}

	@Column({
		name: 'name',
		type: 'varchar',
	})
	name!: string

	@Column({
		name: 'is_correct',
		type: 'boolean',
		default: false,
	})
	isCorrect!: boolean

	@ManyToOne(() => WorkTaskModel, (task) => task.options, {
		onDelete: 'CASCADE',
	})
	task?: WorkTask | undefined

	@RelationId((option: WorkTaskOptionModel) => option.task)
	taskId!: WorkTask['id']

	@ManyToMany(
		() => AssignedWorkAnswerModel,
		(answer) => answer.chosenTaskOptions
	)
	assignedWorkAnswers?: AssignedWorkAnswer[] | undefined

	get assignedWorkAnswerIds(): string[] {
		return (this.assignedWorkAnswers || []).map((answer) => answer.id)
	}
}
