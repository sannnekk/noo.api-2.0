import { BaseModel } from '@modules/Core/Data/Model'
import { Video } from '../Video'
import { User } from '@modules/Users/Data/User'

export interface VideoSaving extends BaseModel {
  video: Video
  user: User
}
