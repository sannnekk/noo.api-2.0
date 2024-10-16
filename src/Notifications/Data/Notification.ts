import { BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'

export type NotificationType =
  | 'work-made'
  | 'work-checked'
  | 'work-transferred'
  | 'poll-answered'
  | 'warning'
  | 'maintenance'
  | 'new-feature'
  | 'announcement'
  | 'welcome'
  | 'mentor-assigned'
  | 'mentor-removed'
  | 'other'

export interface Notification extends BaseModel {
  user: User
  userId: User['id']
  title: string
  message: string | null
  link: string | null
  status: 'read' | 'unread'
  type: NotificationType
  isBanner: boolean
}
