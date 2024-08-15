import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  RelationId,
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
    }
  }

  @OneToOne(() => BlogPostModel, (post) => post.poll, { onDelete: 'CASCADE' })
  post!: BlogPost

  @OneToMany(() => PollQuestionModel, (question) => question.poll, {
    cascade: true,
  })
  questions!: PollQuestion[]

  @ManyToMany(() => UserModel, (user) => user.votedPolls)
  @JoinTable()
  votedUsers!: User[]

  @RelationId((poll: PollModel) => poll.votedUsers)
  votedUserIds?: User['id'][]

  @Column({
    name: 'voted_count',
    type: 'integer',
    default: 0,
  })
  votedCount!: number

  @Column({
    name: 'title',
    type: 'varchar',
  })
  title!: string

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description!: string

  @Column({
    name: 'can_vote',
    type: 'simple-array',
  })
  canVote!: PollVisibility[]

  @Column({
    name: 'can_see_results',
    type: 'simple-array',
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
    query.andWhere('poll.title LIKE :needle', { needle: `%${needle}%` })

    return []
  }
}
