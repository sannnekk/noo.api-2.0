import { UserRoleType } from '@modules/Core/Security/roles'
import { BaseModel } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Course } from '@modules/Courses/Data/Course'
import { Poll } from '@modules/Polls/Data/Poll'

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
	assignedWorksAsStudent?: AssignedWork[] | undefined
	assignedWorksAsMentor?: AssignedWork[] | undefined
	votedPolls?: Poll[]
}
