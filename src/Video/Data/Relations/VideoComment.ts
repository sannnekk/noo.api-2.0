import { type BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'
import { Video } from '../Video'

export interface VideoComment extends BaseModel {
  text: string
  user?: User
  video?: Video
}
