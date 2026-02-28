import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  SelectQueryBuilder,
} from 'typeorm'
import { BlogPostModel } from '@modules/Blog/Data/BlogPostModel'
import { BlogPost } from '@modules/Blog/Data/BlogPost'
import { User } from '@modules/Users/Data/User'
import { UserModel } from '@modules/Users/Data/UserModel'
import { PollQuestionModel } from './Relations/PollQuestionModel'
import { PollQuestion } from './Relations/PollQuestion'
import { Poll, PollVisibility } from './Poll'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { config } from '@modules/config'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import Dates from '@modules/Core/Utils/date'

@Entity('poll')
export class PollModel extends SearchableModel implements Poll {
  public constructor(data?: Partial<Poll>) {
    super()

    if (data) {
      this.set(data)

      if (data.questions) {
        this.questions = data.questions.map(
          (question) => new PollQuestionModel(question)
        )
      }

      this.isStopped = Dates.isInPast(this.stopAt)
    }
  }

  @OneToOne(() => BlogPostModel, (post) => post.poll, { onDelete: 'CASCADE' })
  post!: BlogPost

  @OneToMany(() => CourseMaterialModel, (material) => material.poll)
  materials!: CourseMaterial[]

  @OneToMany(() => PollQuestionModel, (question) => question.poll, {
    cascade: true,
  })
  questions!: PollQuestion[]

  @ManyToMany(() => UserModel, (user) => user.votedPolls)
  @JoinTable()
  votedUsers!: User[]

  @Column({
    name: 'voted_count',
    type: 'integer',
    default: 0,
  })
  votedCount!: number

  @Column({
    name: 'title',
    type: 'varchar',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  title!: string

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  description!: string

  @Column({
    name: 'can_vote',
    type: 'simple-array',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  canVote!: PollVisibility[]

  @Column({
    name: 'can_see_results',
    type: 'simple-array',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  canSeeResults!: PollVisibility[]

  @Column({
    name: 'require_auth',
    type: 'boolean',
    default: false,
  })
  requireAuth!: boolean

  @Column({
    name: 'stop_at',
    type: 'timestamp',
    nullable: true,
  })
  stopAt!: Date

  @Column({
    name: 'is_stopped',
    type: 'boolean',
    default: false,
  })
  isStopped!: boolean

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere('LOWER(poll.title) LIKE LOWER(:needle)', {
      needle: `%${needle}%`,
    })

    return []
  }
}
