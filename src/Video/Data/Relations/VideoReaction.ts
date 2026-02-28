import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { Video } from '../Video'

export interface VideoReaction extends BaseModel {
  reaction: 'like' | 'dislike' | 'sad' | 'happy' | 'mindblowing'
  user?: User
  video?: Video
}
