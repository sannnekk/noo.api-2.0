import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'

export interface PushSubscription extends BaseModel {
  user: User
  userId: User['id']
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string | null
}
