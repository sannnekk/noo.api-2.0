import {
	NotFoundError,
	UnauthenticatedError,
	JWT,
	Hash,
	AlreadyExistError,
	UnknownError,
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

		if (!user) {
			throw new UnauthenticatedError()
		}

		return {
			token: JWT.create({
				userId: user.id,
				username: user.username,
				role: user.role,
				permissions: user.forbidden || 0,
			}),
			user,
		}
	}

	public async getBySlug(slug: string): Promise<User> {
		const user = await this.userRepository.findOne({ slug })

		if (!user) {
			throw new NotFoundError()
		}

		user.password = undefined

		return user
	}

	public async update(user: User): Promise<void> {
		const existingUser = await this.userRepository.findOne({
			id: user.id,
		})

		if (!existingUser) {
			throw new NotFoundError()
		}

		await this.userRepository.update(user)
	}

	public async delete(id: string): Promise<void> {
		await this.userRepository.delete(id)
	}
}
