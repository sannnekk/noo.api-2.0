import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { Model } from '@modules/Core/Data/Model'
import type { UserRolesType } from '@modules/Core/Security/roles'
import type { User } from './User'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import type { Course } from '@modules/Courses/Data/Course'
import type { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { BlogPostModel } from '@modules/Blog/Data/BlogPostModel'
import { BlogPostReactionModel } from '@modules/Blog/Data/Relations/BlogPostReactionModel'
import type { BlogPostReaction } from '@modules/Blog/Data/Relations/BlogPostReaction'
import type { BlogPost } from '@modules/Blog/Data/BlogPost'
import { PollAnswerModel } from '@modules/Polls/Data/Relations/PollAnswerModel'
import { PollAnswer } from '@modules/Polls/Data/Relations/PollAnswer'
import { PollModel } from '@modules/Polls/Data/PollModel'
import { Poll } from '@modules/Polls/Data/Poll'

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
	role!: User['role']

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

	@ManyToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.mentors)
	assignedWorksAsMentor?: AssignedWork[]

	@OneToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.student)
	assignedWorksAsStudent?: AssignedWork[]

	@OneToMany(() => BlogPostModel, (post) => post.author)
	blogPosts?: BlogPost[]

	@OneToMany(() => BlogPostReactionModel, (reaction) => reaction.user)
	blogPostReactions?: BlogPostReaction[]

	@OneToMany(() => PollAnswerModel, (answer) => answer.user)
	pollAnswers?: PollAnswer[]

	@ManyToMany(() => PollModel, (poll) => poll.votedUsers)
	votedPolls!: Poll[]

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
	isBlocked!: boolean

	@Column({
		name: 'forbidden',
		type: 'int',
		default: 0,
	})
	forbidden!: number

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
