import { User } from '../Data/User'

export interface UpdateUserDTO {
  id: User['id']
  name?: User['name']
  avatar?: User['avatar']
  //password?: User['password']
  isBlocked?: User['isBlocked']
  forbidden?: User['forbidden']
}
