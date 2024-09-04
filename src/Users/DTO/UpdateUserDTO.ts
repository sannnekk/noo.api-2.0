import { User } from '../Data/User'

export interface UpdateUserDTO {
  id: User['id']
  name?: User['name']
  avatar?: User['avatar']
  isBlocked?: User['isBlocked']
  forbidden?: User['forbidden']
  telegramNotificationsEnabled?: User['telegramNotificationsEnabled']
}
