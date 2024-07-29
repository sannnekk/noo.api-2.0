import { Model } from '@modules/Core/Data/Model'
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { Media } from '@modules/Media/Data/Media'
import { PollQuestion, PollQuestionType } from './PollQuestion'
import { Poll } from '../Poll'
import { PollModel } from '../PollModel'
import { PollAnswer } from './PollAnswer'
import { PollAnswerModel } from './PollAnswerModel'

@Entity('poll_question')
export class PollQuestionModel extends Model implements PollQuestion {
  public constructor(data?: Partial<PollQuestion>) {
    super()

    if (data) {
      this.set(data)

      if (data.answers) {
        this.answers = data.answers.map((answer) => new PollAnswerModel(answer))
      }

      switch (data.type) {
        case 'choice':
          this.resetOptions()
          this.minChoices = data.minChoices
          this.maxChoices = data.maxChoices
          this.choices = data.choices
          break
        case 'rating':
          this.resetOptions()
          this.minRating = data.minRating
          this.maxRating = data.maxRating
          this.onlyIntegerRating = data.onlyIntegerRating
          break
        case 'file':
          this.resetOptions()
          this.maxFileSize = data.maxFileSize
          this.maxFileCount = data.maxFileCount
          this.allowedFileTypes = data.allowedFileTypes
          break
        case 'text':
          this.resetOptions()
          this.minLength = data.minLength
          this.maxLength = data.maxLength
          break
        case 'number':
          this.resetOptions()
          this.minValue = data.minValue
          this.maxValue = data.maxValue
          this.onlyIntegerValue = data.onlyIntegerValue
          break
        case 'date':
          this.resetOptions()
          this.onlyFutureDate = data.onlyFutureDate
          this.onlyPastDate = data.onlyPastDate
          break
        case undefined:
        default:
          break
      }
    }
  }

  @ManyToOne(() => PollModel, (poll) => poll.questions)
  poll!: Poll

  @RelationId((question: PollQuestionModel) => question.poll)
  pollId!: string

  @OneToMany(() => PollAnswerModel, (answer) => answer.question, {
    onDelete: 'CASCADE',
  })
  answers!: PollAnswer[]

  @Column({
    name: 'text',
    type: 'text',
  })
  text!: string

  @Column({
    name: 'order',
    type: 'int',
    default: 0,
  })
  order!: number

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['text', 'number', 'date', 'file', 'choice', 'rating'],
  })
  type!: PollQuestionType

  @Column({
    name: 'required',
    type: 'boolean',
    default: true,
  })
  required!: boolean

  @Column({
    name: 'choices',
    type: 'text',
    nullable: true,
  })
  _choices?: string

  get choices(): string[] | undefined {
    return this._choices?.split('|')
  }

  set choices(choices: string[] | undefined) {
    this._choices = choices?.join('|')
  }

  @Column({
    name: 'min_choices',
    type: 'int',
    nullable: true,
  })
  minChoices?: number

  @Column({
    name: 'max_choices',
    type: 'int',
    nullable: true,
  })
  maxChoices?: number

  @Column({
    name: 'min_rating',
    type: 'int',
    nullable: true,
  })
  minRating?: number

  @Column({
    name: 'max_rating',
    type: 'int',
    nullable: true,
  })
  maxRating?: number

  @Column({
    name: 'only_integer_rating',
    type: 'boolean',
    default: false,
  })
  onlyIntegerRating?: boolean

  @Column({
    name: 'max_file_size',
    type: 'int',
    nullable: true,
  })
  maxFileSize?: number

  @Column({
    name: 'max_file_count',
    type: 'int',
    nullable: true,
  })
  maxFileCount?: number

  @Column({
    name: 'allowed_file_types',
    type: 'simple-array',
    nullable: true,
  })
  allowedFileTypes?: Media['mimeType'][]

  @Column({
    name: 'min_length',
    type: 'int',
    nullable: true,
  })
  minLength?: number

  @Column({
    name: 'max_length',
    type: 'int',
    nullable: true,
  })
  maxLength?: number

  @Column({
    name: 'min_value',
    type: 'int',
    nullable: true,
  })
  minValue?: number

  @Column({
    name: 'max_value',
    type: 'int',
    nullable: true,
  })
  maxValue?: number

  @Column({
    name: 'only_integer_value',
    type: 'boolean',
    default: false,
  })
  onlyIntegerValue?: boolean

  @Column({
    name: 'only_future_date',
    type: 'boolean',
    default: false,
  })
  onlyFutureDate?: boolean

  @Column({
    name: 'only_past_date',
    type: 'boolean',
    default: false,
  })
  onlyPastDate?: boolean

  public static entriesToSearch(): string[] {
    return ['text', 'description']
  }

  private resetOptions(): void {
    this.minChoices = undefined
    this.maxChoices = undefined
    this.choices = undefined
    this.minRating = undefined
    this.maxRating = undefined
    this.onlyIntegerRating = undefined
    this.maxFileSize = undefined
    this.maxFileCount = undefined
    this.allowedFileTypes = undefined
    this.minLength = undefined
    this.maxLength = undefined
    this.minValue = undefined
    this.maxValue = undefined
    this.onlyIntegerValue = undefined
    this.onlyFutureDate = undefined
    this.onlyPastDate = undefined
  }
}
