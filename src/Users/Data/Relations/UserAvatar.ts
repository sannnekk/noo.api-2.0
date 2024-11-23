import { BaseModel } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'

export interface UserAvatar extends BaseModel {
  media?: Media | null
  avatarType: 'telegram' | 'custom'
  telegramAvatarUrl: string | null
}
