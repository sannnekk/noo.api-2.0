import {
  Brackets,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import type { UserRolesType } from '@modules/Core/Security/roles'
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
import type { User } from './User'
import { SessionModel } from '@modules/Sessions/Data/SessionModel'
import { Session } from '@modules/Sessions/Data/Session'
import { UserAvatar } from './Relations/UserAvatar'
import { UserAvatarModel } from './Relations/UserAvatarModel'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { MentorAssignmentModel } from './Relations/MentorAssignmentModel'
import { SnippetModel } from '@modules/Snippets/Data/SnippetModel'
import { Snippet } from '@modules/Snippets/Data/Snippet'
import { config } from '@modules/config'
import { NotificationModel } from '@modules/Notifications/Data/NotificationModel'

@Entity('user')
export class UserModel extends SearchableModel implements User {
  constructor(data?: Partial<User>) {
    super()

    if (data) {
      this.set(data)

      if (!data.slug && data.username) {
        this.slug = this.sluggify(this.username)
      }

      if (data.avatar) {
        this.avatar = new UserAvatarModel(data.avatar)
      }
    }
  }

  @Column({
    name: 'username',
    type: 'varchar',
    nullable: false,
    unique: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  username!: string

  @Column({
    name: 'slug',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  slug!: string

  @Column({
    name: 'role',
    type: 'enum',
    enum: ['student', 'mentor', 'teacher', 'admin'] as UserRolesType,
    default: 'student',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  role!: User['role']

  @Column({
    name: 'name',
    type: 'varchar',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  name!: string

  @Column({
    name: 'email',
    type: 'varchar',
    unique: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  email!: string

  @Column({
    name: 'new_email',
    type: 'varchar',
    nullable: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  newEmail?: string

  @OneToMany(() => MentorAssignmentModel, (assignment) => assignment.mentor)
  mentorAssignmentsAsMentor?: MentorAssignmentModel[]

  @OneToMany(() => MentorAssignmentModel, (assignment) => assignment.student)
  mentorAssignmentsAsStudent?: MentorAssignmentModel[]

  @OneToMany(() => CourseModel, (course) => course.author)
  courses?: Course[]

  @ManyToMany(() => CourseModel, (course) => course.students)
  @JoinTable()
  coursesAsStudent?: Course[]

  @RelationId((user: UserModel) => user.coursesAsStudent)
  courseAsStudentIds!: string[]

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

  @OneToMany(() => NotificationModel, (notification) => notification.user)
  notifications?: Notification[]

  @OneToMany(() => SessionModel, (session) => session.user, {
    onDelete: 'CASCADE',
  })
  sessions?: Session[]

  @OneToMany(() => SnippetModel, (snippet) => snippet.user)
  snippets!: Snippet[]

  @OneToOne(() => UserAvatarModel, (avatar) => avatar.user, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  avatar!: UserAvatar | null

  @Column({
    name: 'telegram_id',
    type: 'varchar',
    nullable: true,
    default: null,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  telegramId?: string | undefined

  @Column({
    name: 'telegram_username',
    type: 'varchar',
    nullable: true,
    default: null,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  telegramUsername?: string | undefined

  @Column({
    name: 'password',
    type: 'varchar',
    nullable: true,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
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
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  verificationToken!: string | null

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(user.username) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
        qb.orWhere('LOWER(user.name) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
        qb.orWhere('LOWER(user.email) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
        qb.orWhere('LOWER(user.telegramUsername) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
      })
    )

    return []
  }

  private sluggify(username: string): string {
    return username.toLowerCase().replace(/\s/g, '-')
  }

  public static getRoleName(role: User['role']): string {
    switch (role) {
      case 'student':
        return 'Ученик'
      case 'mentor':
        return 'Куратор'
      case 'teacher':
        return 'Преподаватель'
      case 'admin':
        return 'Администратор'
    }
  }
}
