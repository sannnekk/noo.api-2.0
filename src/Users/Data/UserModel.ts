import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { Model, type UserRolesType } from '@core'
import { User } from './User'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { Course } from '@modules/Courses/Data/Course'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'

@Entity('user')
export class UserModel extends Model implements User {
	constructor(data?: Partial<User>) {
		super()

		if (data) {
			this.set(data)

			if (!data.slug && data.username) {
				this.slug = this.sluggify(this.username)
			}
		}
	}

	@Column({
		name: 'username',
		type: 'varchar',
		nullable: false,
		unique: true,
	})
	username!: string

	@Column({
		name: 'slug',
		type: 'varchar',
	})
	slug!: string

	@Column({
		name: 'role',
		type: 'enum',
		enum: ['student', 'mentor', 'teacher', 'admin'] as UserRolesType,
		default: 'student',
	})
	role: User['role'] = 'student'

	@Column({
		name: 'name',
		type: 'varchar',
	})
	name!: string

	@Column({
		name: 'email',
		type: 'varchar',
		unique: true,
	})
	email!: string

	@OneToMany(() => UserModel, (user) => user.mentor)
	students?: User[]

	@RelationId((user: UserModel) => user.mentor)
	mentorId?: string

	@ManyToOne(() => UserModel, (user) => user.students)
	mentor?: User

	@OneToMany(() => CourseModel, (course) => course.author)
	courses?: Course[]

	@RelationId((user: UserModel) => user.courses)
	courseIds!: string[]

	@ManyToMany(() => CourseModel, (course) => course.students)
	@JoinTable()
	coursesAsStudent?: Course[]

	@RelationId((user: UserModel) => user.coursesAsStudent)
	courseIdsAsStudent!: string[]

	@ManyToMany(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.mentors
	)
	assignedWorksAsMentor?: AssignedWork[]

	@RelationId((user: UserModel) => user.assignedWorksAsMentor)
	assignedWorkIdsAsMentor!: string[]

	@OneToMany(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.student
	)
	assignedWorksAsStudent?: AssignedWork[]

	@RelationId((user: UserModel) => user.assignedWorksAsStudent)
	assignedWorkIdsAsStudent!: string[]

	@Column({
		name: 'telegram_id',
		type: 'varchar',
		nullable: true,
		default: null,
	})
	telegramId?: string | undefined

	@Column({
		name: 'telegram_username',
		type: 'varchar',
		nullable: true,
		default: null,
	})
	telegramUsername?: string | undefined

	@Column({
		name: 'password',
		type: 'varchar',
		nullable: true,
	})
	password!: string

	@Column({
		name: 'is_blocked',
		type: 'boolean',
		default: false,
	})
	isBlocked: boolean = false

	@Column({
		name: 'forbidden',
		type: 'int',
		default: 0,
	})
	forbidden: number = 0

	@Column({
		name: 'verification_token',
		type: 'varchar',
		nullable: true,
	})
	verificationToken?: string

	static entriesToSearch(): string[] {
		return ['username', 'name', 'email', 'telegramUsername']
	}

	private sluggify(username: string): string {
		return username.toLowerCase().replace(/\s/g, '-')
	}
}
