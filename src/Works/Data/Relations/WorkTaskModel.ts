import { DeltaContentType, Model, Transliteration, ULID } from '@core'
import { WorkTask } from './WorkTask'
import { Work } from '../Work'
import { WorkTaskOption } from './WorkTaskOption'
import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { WorkModel } from '../WorkModel'
import { WorkTaskOptionModel } from './WorkTaskOptionModel'
import { AssignedWorkAnswer } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswer'
import { AssignedWorkAnswerModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswerModel'
import { AssignedWorkComment } from '@modules/AssignedWorks/Data/Relations/AssignedWorkComment'
import { AssignedWorkCommentModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkCommentModel'

@Entity('work_task')
export class WorkTaskModel extends Model implements WorkTask {
	constructor(data?: Partial<WorkTask>) {
		super()

		if (data) {
			this.set(data)

			this.options = (data.options || []).map(
				(option) => new WorkTaskOptionModel(option)
			)

			this.assignedWorkAnswers = (data.assignedWorkAnswers || []).map(
				(answer) => new AssignedWorkAnswerModel(answer)
			)

			this.assignedWorkComments = (data.assignedWorkComments || []).map(
				(comment) => new AssignedWorkCommentModel(comment)
			)

			if (!data.slug) {
				this.slug = this.sluggify(this.name)
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
		name: 'name',
		type: 'varchar',
	})
	name!: string

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

	@OneToMany(
		() => WorkTaskOptionModel,
		(taskOption) => taskOption.task,
		{ eager: true, cascade: true }
	)
	options?: WorkTaskOption[] | undefined

	get optionIds(): string[] | undefined {
		return this.options?.map((option) => option.id)
	}

	set optionIds(ids: string[] | undefined) {}

	@OneToMany(() => AssignedWorkAnswerModel, (answer) => answer.task)
	assignedWorkAnswers?: AssignedWorkAnswer[] | undefined

	get assignedWorkAnswerIds(): string[] | undefined {
		return this.assignedWorkAnswers?.map((answer) => answer.id)
	}

	set assignedWorkAnswerIds(ids: string[] | undefined) {}

	@OneToMany(() => AssignedWorkCommentModel, (comment) => comment.task)
	assignedWorkComments?: AssignedWorkComment[] | undefined

	get assignedWorkCommentIds(): string[] | undefined {
		return this.assignedWorkComments?.map((comment) => comment.id)
	}

	set assignedWorkCommentIds(ids: string[] | undefined) {}

	private sluggify(text: string): string {
		return ULID.generate() + '-' + Transliteration.sluggify(text)
	}
}
