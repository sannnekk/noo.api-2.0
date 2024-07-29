import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import type { PollQuestion } from './Relations/PollQuestion'
import { BlogPost } from '@modules/Blog/Data/BlogPost'

export type PollVisibility = User['role'] | 'everyone'

export interface Poll extends BaseModel {
  title: string
  description: string
  canVote: PollVisibility[]
  canSeeResults: PollVisibility[]
  requireAuth: boolean
  stopAt: Date
  isStopped: boolean
  createdAt: Date
  updatedAt: Date
  questions: PollQuestion[]
  votedUsers?: User[]
  votedCount: number
  post?: BlogPost
}
