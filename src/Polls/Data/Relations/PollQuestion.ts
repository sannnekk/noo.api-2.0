import { BaseModel } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'
import { PollAnswer } from './PollAnswer'
import { Poll } from '../Poll'

export type PollQuestionType =
  | 'text'
  | 'number'
  | 'date'
  | 'file'
  | 'choice'
  | 'rating'

export interface PollQuestion extends BaseModel {
  text: string
  order: number
  description?: string
  type: PollQuestionType
  required: boolean
  answers?: PollAnswer[]
  poll?: Poll

  // choice
  choices?: string[]
  minChoices?: number
  maxChoices?: number

  // rating
  minRating?: number
  maxRating?: number
  onlyIntegerRating?: boolean

  // file
  maxFileSize?: number
  maxFileCount?: number
  allowedFileTypes?: Media['mimeType'][]

  // text
  minLength?: number
  maxLength?: number

  // number
  minValue?: number
  maxValue?: number
  onlyIntegerValue?: boolean

  // date
  onlyFutureDate?: boolean
  onlyPastDate?: boolean
}
