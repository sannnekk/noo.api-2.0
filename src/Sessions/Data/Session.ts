import { type BaseModel } from '@modules/Core/Data/Model'
import { User } from '@modules/Users/Data/User'

export interface Session extends BaseModel {
  userAgent: string
  isMobile: boolean
  userId: User['id']
  user?: User
  browser?: string | null
  os?: string | null
  device?: string | null
  ipAddress: string
  lastRequestAt: Date
  location?: string | null
}
