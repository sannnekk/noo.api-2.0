import { BaseModel } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'

export interface UserAvatar extends BaseModel {
  media?: Media
  avatarType: 'telegram' | 'custom'
  telegramAvatarUrl?: string
}
