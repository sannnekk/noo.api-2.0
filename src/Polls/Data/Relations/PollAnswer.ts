import { BaseModel } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'
import { User } from '@modules/Users/Data/User'
import { PollQuestion } from './PollQuestion'
import { Poll } from '../Poll'

export type PollUserAuthType = 'telegram' | 'api'

export interface PollAnswer extends BaseModel {
  userAuthType: PollUserAuthType
  userAuthData: Record<string, unknown> | null
  userAuthIdentifier?: string
  questionId: string
  question?: PollQuestion
  questionType: PollQuestion['type']
  user?: User
  userId: string
  // answer types
  text?: string
  number?: number
  date?: Date
  files?: Media[] | undefined
  choices?: string[]
  rating?: number
  poll?: Poll
}
