import { User } from '../Data/User'

export interface UpdateUserDTO {
  id: User['id']
  name?: User['name']
  email?: User['email']
  isBlocked?: User['isBlocked']
}
