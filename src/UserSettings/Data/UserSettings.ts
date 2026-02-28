import type { BaseModel } from '@modules/Core/Data/Model'
import type { User } from '@modules/Users/Data/User'
import type { Media } from '@modules/Media/Data/Media'

export interface UserSettings extends BaseModel {
  user: User
  backgroundImage: Media | null
  fontSize: 'small' | 'medium' | 'large'
}
