import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { AssignedWork } from './AssignedWork'
import { User } from '@modules/Users/Data/User'
import { Work } from '@modules/Works/Data/Work'
import { AssignedWorkAnswer } from './Relations/AssignedWorkAnswer'
import { AssignedWorkComment } from './Relations/AssignedWorkComment'
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { UserModel } from '@modules/Users/Data/UserModel'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel'
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel'
import { CalenderEventModel } from '@modules/Calender/Data/CalenderEventModel'

@Entity('assigned_work')
export class AssignedWorkModel extends Model implements AssignedWork {
	constructor(data?: Partial<AssignedWork>) {
		super()

		if (data) {
			this.set(data)

			if (!data.slug) {
				this.slug = this.sluggify()
			}

			this.mentors = (data.mentors || []).map(
				(mentor) => new UserModel(mentor)
			)

			this.answers = (data.answers || []).map(
				(answer) => new AssignedWorkAnswerModel(answer)
			)

			this.comments = (data.comments || []).map(
				(comment) => new AssignedWorkCommentModel(comment)
			)
		}
	}

	@Column({
		name: 'slug',
		type: 'varchar',
	})
	slug!: string

	@ManyToMany(() => UserModel, (user) => user.assignedWorksAsMentor, {
		eager: true,
		cascade: true,
	})
	@JoinTable()
	mentors?: User[] | undefined

	@RelationId((assignedWork: AssignedWorkModel) => assignedWork.mentors)
	mentorIds!: string[]

	@ManyToOne(() => UserModel, (user) => user.assignedWorksAsStudent)
	student!: User | undefined

	@RelationId((assignedWork: AssignedWorkModel) => assignedWork.student)
	studentId!: User['id']

	@ManyToOne(() => WorkModel, (work) => work.assignedWorks, {
		eager: true,
	})
	work!: Work

	@RelationId((assignedWork: AssignedWorkModel) => assignedWork.work)
	workId!: Work['id']

	@Column({
		name: 'solve_status',
		type: 'enum',
		enum: [
			'not-started',
			'in-progress',
			'made-in-deadline',
			'made-after-deadline',
		],
		default: 'not-started',
	})
	solveStatus:
		| 'not-started'
		| 'in-progress'
		| 'made-in-deadline'
		| 'made-after-deadline' = 'not-started'

	@Column({
		name: 'check_status',
		type: 'enum',
		enum: [
			'not-checked',
			'in-progress',
			'checked-in-deadline',
			'checked-after-deadline',
		],
		default: 'not-checked',
	})
	checkStatus:
		| 'not-checked'
		| 'in-progress'
		| 'checked-in-deadline'
		| 'checked-after-deadline' = 'not-checked'

	@Column({
		name: 'solve_deadline_at',
		type: 'timestamp',
		nullable: true,
	})
	solveDeadlineAt?: Date | undefined

	@Column({
		name: 'solve_deadline_shifted',
		type: 'boolean',
		default: false,
	})
	solveDeadlineShifted: boolean = false

	@Column({
		name: 'check_deadline_at',
		type: 'timestamp',
		nullable: true,
	})
	checkDeadlineAt?: Date | undefined

	@Column({
		name: 'check_deadline_shifted',
		type: 'boolean',
		default: false,
	})
	checkDeadlineShifted: boolean = false

	@Column({
		name: 'solved_at',
		type: 'timestamp',
		nullable: true,
	})
	solvedAt?: Date | undefined

	@Column({
		name: 'checked_at',
		type: 'timestamp',
		nullable: true,
	})
	checkedAt?: Date | undefined

	@OneToMany(
		() => AssignedWorkAnswerModel,
		(answer) => answer.assignedWork,
		{ cascade: true }
	)
	answers!: AssignedWorkAnswer[]

	@RelationId((assignedWork: AssignedWorkModel) => assignedWork.answers)
	answerIds!: string[]

	@OneToMany(
		() => AssignedWorkCommentModel,
		(comment) => comment.assignedWork,
		{ cascade: true, eager: true }
	)
	comments!: AssignedWorkComment[]

	@RelationId(
		(assignedWork: AssignedWorkModel) => assignedWork.comments
	)
	commentIds!: string[]

	@OneToMany(
		() => CalenderEventModel,
		(calenderEvent) => calenderEvent.assignedWork
	)
	calenderEvents!: CalenderEventModel[]

	@RelationId(
		(assignedWork: AssignedWorkModel) => assignedWork.calenderEvents
	)
	calenderEventIds!: CalenderEventModel['id'][]

	@Column({
		name: 'score',
		type: 'int',
		nullable: true,
	})
	score?: number | undefined

	@Column({
		name: 'max_score',
		type: 'int',
	})
	maxScore!: number

	@Column({
		name: 'is_archived',
		type: 'boolean',
		default: false,
	})
	isArchived: boolean = false

	static entriesToSearch() {
		return [
			'work.name',
			'work.description',
			'student.name',
			'mentors.name',
		]
	}

	private sluggify(): string {
		return ULID.generate()
	}
}
