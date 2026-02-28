import {
  Brackets,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import { Media } from '@modules/Media/Data/Media'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import { PollQuestion } from './PollQuestion'
import { PollQuestionModel } from './PollQuestionModel'
import { PollAnswer } from './PollAnswer'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { config } from '@modules/config'

@Entity('poll_answer')
export class PollAnswerModel extends SearchableModel implements PollAnswer {
  public constructor(data?: Partial<PollAnswer>) {
    super()

    if (data) {
      this.set(data)

      if (data.files) {
        this.files = data.files.map((file) => new MediaModel(file))
      }

      if (data.questionId) {
        this.question = { id: data.questionId } as PollQuestion
      }
    }
  }

  @ManyToOne(() => PollQuestionModel, (question) => question.answers, {
    onDelete: 'CASCADE',
  })
  question!: PollQuestion

  @RelationId((answer: PollAnswerModel) => answer.question)
  questionId!: string

  @ManyToOne(() => UserModel, (user) => user.pollAnswers, {
    onDelete: 'CASCADE',
  })
  user!: User

  @RelationId((answer: PollAnswerModel) => answer.user)
  userId!: string

  @Column({
    name: 'user_auth_type',
    type: 'varchar',
    default: 'api',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  userAuthType!: PollAnswer['userAuthType']

  @Column({
    name: 'user_auth_data',
    type: 'varchar',
    nullable: true,
    default: null,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  userAuthData!: Record<string, unknown> | null

  @Column({
    name: 'user_auth_identifier',
    type: 'varchar',
    nullable: true,
    default: null,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  userAuthIdentifier!: string

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: ['text', 'number', 'date', 'file', 'choice', 'rating'],
  })
  questionType!: PollQuestion['type']

  @Column({
    name: 'text',
    type: 'text',
    nullable: true,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  text?: string | undefined

  @Column({
    name: 'number',
    type: 'int',
    nullable: true,
  })
  number?: number | undefined

  @Column({
    name: 'date',
    type: 'timestamp',
    nullable: true,
  })
  date?: Date | undefined

  @OneToMany(() => MediaModel, (media) => media.pollAnswer, {
    cascade: true,
    eager: true,
  })
  files?: Media[] | undefined

  @Column({
    name: 'choices',
    type: 'text',
    nullable: true,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  _choices?: string

  get choices(): string[] | undefined {
    return this._choices?.split('|')
  }

  set choices(choices: string[] | undefined) {
    this._choices = choices?.join('|')
  }

  @Column({
    name: 'rating',
    type: 'int',
    nullable: true,
  })
  rating?: number | undefined

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('poll_answer.user_auth_data LIKE :needle', {
          needle: `%${needle}%`,
        })
        qb.orWhere('poll_answer.text LIKE :needle', { needle: `%${needle}%` })
      })
    )

    return []
  }
}
