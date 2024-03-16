import { UserRoleType, BaseModel, ULID } from '@core'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Course } from '@modules/Courses/Data/Course'

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
	mentor?: User
	courses?: Course[]
	courseIds: ULID.Ulid[]
	verificationToken?: string
	coursesAsStudent?: Course[]
	courseIdsAsStudent: ULID.Ulid[]
	assignedWorksAsStudent?: AssignedWork[] | undefined
	assignedWorksAsMentor?: AssignedWork[] | undefined
	assignedWorkIdsAsStudent: ULID.Ulid[] | undefined
	assignedWorkIdsAsMentor: ULID.Ulid[] | undefined
}
