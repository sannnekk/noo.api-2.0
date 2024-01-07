import { UserRoleType, BaseModel, ULID } from '@core'

export interface User extends BaseModel {
	slug: string
	role: UserRoleType
	name: string
	username: string
	email: string
	// TODO: avatar?: Media
	students?: User[]
	telegramUsername?: string
	telegramId?: string
	password?: string
	isBlocked: boolean
	forbidden?: number
	mentorId?: ULID.Ulid
}
