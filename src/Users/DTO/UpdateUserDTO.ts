import { User } from '../Data/User'

export interface UpdateUserDTO {
	id: User['id']
	name?: User['name']
	telegramUsername?: User['telegramUsername']
	email?: User['email']
	password?: User['password']
	role?: User['role']
	isBlocked?: User['isBlocked']
}
