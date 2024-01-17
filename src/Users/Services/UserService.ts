import { Pagination } from './../../Core/Data/Pagination'
import {
	NotFoundError,
	UnauthenticatedError,
	JWT,
	Hash,
	AlreadyExistError,
	UnknownError,
	WrongRoleError,
} from '@core'
import { User } from '../Data/User'
import { UserRepository } from '../Data/UserRepository'

export class UserService {
	private readonly userRepository: UserRepository

	constructor() {
		this.userRepository = new UserRepository()
	}

	public async create(user: User): Promise<void> {
		user.password = await Hash.hash(user.password!)

		try {
			await this.userRepository.create(user)
		} catch (error: any) {
			if (error.code === '23505') {
				throw new AlreadyExistError()
			}

			throw new UnknownError()
		}
	}

	public async register(user: User): Promise<void> {
		user.role = 'student'
		await this.create(user)
	}

	public async assignMentor(
		studentId: User['id'],
		mentorId: User['id']
	) {
		const student = await this.userRepository.findOne({ id: studentId })
		const mentor = await this.userRepository.findOne({ id: mentorId })

		if (!student || !mentor) {
			throw new NotFoundError()
		}

		student.mentor = mentorId as any

		await this.userRepository.update(student)
	}

	public async login(credentials: {
		username: string
		password: string
	}): Promise<{ token: JWT.JWT; user: Partial<User> }> {
		const user = await this.userRepository.findOne({
			username: credentials.username,
		})

		if (
			!user ||
			!(await Hash.compare(credentials.password, user.password!))
		) {
			throw new UnauthenticatedError()
		}

		return {
			token: JWT.create({
				userId: user.id,
				username: user.username,
				role: user.role,
				permissions: user.forbidden || 0,
				isBlocked: user.isBlocked,
			}),
			user,
		}
	}

	public async getBySlug(slug: string): Promise<User> {
		const user = await this.userRepository.findOne({ slug }, [
			'students',
			'courses',
			'mentor',
		])

		if (!user) {
			throw new NotFoundError()
		}

		user.password = undefined

		return user
	}

	public async getUsers(
		pagination: Pagination | undefined,
		role: User['role'],
		userId: User['id']
	): Promise<User[]> {
		let condition: Record<string, any> | undefined

		switch (role) {
			case 'admin':
			case 'teacher':
				condition = undefined
				break
			case 'mentor':
				condition = { mentor: { id: userId } }
				break
			default:
				throw new WrongRoleError()
		}

		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = ['username', 'name', 'email']

		const users = await this.userRepository.find(
			condition,
			['students', 'courses'],
			pagination
		)

		return users.map((user) => {
			user.password = undefined
			return user
		})
	}

	public async getMentors(
		pagination: Pagination | undefined
	): Promise<User[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = ['username', 'name', 'email']

		return await this.userRepository.find(
			{ role: 'mentor' },
			['students'],
			pagination
		)
	}

	public async getStudents(
		pagination: Pagination | undefined
	): Promise<User[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = ['username', 'name', 'email']

		return await this.userRepository.find(
			{ role: 'student' },
			['mentor'],
			pagination
		)
	}

	public async update(user: Partial<User>): Promise<void> {
		const existingUser = await this.userRepository.findOne({
			id: user.id,
		})

		if (!existingUser) {
			throw new NotFoundError()
		}

		if (user.password) user.password = await Hash.hash(user.password!)

		user.createdAt = undefined
		user.updatedAt = undefined
		user.slug = undefined

		if (existingUser.role !== 'student') {
			user.role = undefined
		}

		await this.userRepository.update(<User>user)
	}

	public async delete(id: string): Promise<void> {
		const user = await this.userRepository.findOne({ id })

		if (!user) {
			throw new NotFoundError()
		}

		user.name = 'Deleted User'
		user.username = user.slug =
			'deleted-' + Math.random().toString(36).substr(2, 9)
		user.email = ''
		user.isBlocked = true
		user.telegramId = undefined
		user.telegramUsername = undefined

		await this.userRepository.update(user)
	}
}
