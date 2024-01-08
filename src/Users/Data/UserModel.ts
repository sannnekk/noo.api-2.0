import {
	Column,
	Entity,
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

	@ManyToMany(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.mentors
	)
	assignedWorksAsMentor?: AssignedWork[]

	@OneToMany(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.student
	)
	assignedWorksAsStudent?: AssignedWork[]

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

	private sluggify(username: string): string {
		return username.toLowerCase().replace(/\s/g, '-')
	}
}
