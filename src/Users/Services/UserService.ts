import {
	NotFoundError,
	UnauthenticatedError,
	JWT,
	Hash,
	AlreadyExistError,
	UnknownError,
	Pagination,
	Service,
	EmailService,
} from '@core'
import { User } from '../Data/User'
import { UserRepository } from '../Data/UserRepository'
import { LoginCredentials } from '../Data/LoginCredentials'
import { UserModel } from '../Data/UserModel'

export class UserService extends Service<User> {
	private readonly userRepository: UserRepository
	private readonly emailService: EmailService

	constructor() {
		super()

		this.userRepository = new UserRepository()
		this.emailService = new EmailService()
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
		// every user is a student at the moment of registration
		user.role = 'student'
		user.verificationToken = await Hash.hash(Math.random().toString())

		await this.create(user)

		await this.emailService.sendVerificationEmail(
			user.email,
			user.name,
			user.verificationToken
		)
	}

	public async verify(username: string, token: string): Promise<void> {
		const user = await this.userRepository.findOne({
			username: username,
		})

		if (!user) {
			throw new NotFoundError()
		}

		user.verificationToken = null as any

		await this.userRepository.update(user)
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

	public async login(
		credentials: LoginCredentials
	): Promise<{ token: JWT.JWT; user: Partial<User> }> {
		const user = await this.userRepository.findOne(
			[
				{
					username: credentials.usernameOrEmail,
				},
				{
					email: credentials.usernameOrEmail,
				},
			],
			['students', 'mentor']
		)

		if (
			!user ||
			!(await Hash.compare(credentials.password, user.password!))
		) {
			throw new UnauthenticatedError()
		}

		if (user.isBlocked) {
			throw new UnauthenticatedError('Этот аккаунт заблокирован.')
		}

		if (user.verificationToken) {
			throw new UnauthenticatedError(
				'Этот аккаунт не подтвержден. Перейдите по ссылке в письме, отправленном на вашу почту, чтобы подтвердить регистрацию.'
			)
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

	public async forgotPassword(email: string): Promise<void> {
		const user = await this.userRepository.findOne({ email })

		if (!user) {
			throw new NotFoundError()
		}

		if (user.isBlocked) {
			throw new UnauthenticatedError('Этот аккаунт заблокирован.')
		}

		if (user.verificationToken) {
			throw new UnauthenticatedError(
				'Этот аккаунт не подтвержден. Перейдите по ссылке в письме, отправленном на вашу почту, чтобы подтвердить регистрацию.'
			)
		}

		const newPassword = Math.random().toString(36).slice(-12)

		user.password = await Hash.hash(newPassword)

		await this.userRepository.update(user)

		await this.emailService.sendForgotPasswordEmail(
			user.email,
			user.name,
			newPassword
		)
	}

	public async getByUsername(username: string): Promise<User> {
		const user = await this.userRepository.findOne({ username }, [
			'students',
			'courses',
			'courses.students' as any,
			'mentor',
		])

		if (!user) {
			throw new NotFoundError()
		}

		return user
	}

	public async getUsers(
		pagination: Pagination | undefined
	): Promise<User[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['students' as const, 'courses' as const]

		const users = await this.userRepository.find(
			undefined,
			relations,
			pagination
		)

		this.storeRequestMeta(
			this.userRepository,
			undefined,
			relations,
			pagination
		)

		return users
	}

	public async getStudentsOf(
		mentorId: User['id'],
		pagination?: Pagination
	): Promise<User[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['students' as const]
		const conditions: any = {
			mentor: { id: mentorId } as any,
			role: 'student',
		}

		const users = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		this.storeRequestMeta(
			this.userRepository,
			conditions,
			relations,
			pagination
		)

		return users
	}

	public async getMentors(
		pagination: Pagination | undefined
	): Promise<User[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['students' as const]
		const conditions = { role: 'mentor' as const }

		const mentors = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		this.storeRequestMeta(
			this.userRepository,
			conditions,
			relations,
			pagination
		)

		return mentors
	}

	public async getStudents(
		pagination: Pagination | undefined
	): Promise<User[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['mentor' as const]
		const conditions = { role: 'student' as const }

		const students = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		this.storeRequestMeta(
			this.userRepository,
			conditions,
			relations,
			pagination
		)

		return students
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
		} else if (user.role) {
			user.coursesAsStudent = []
			user.mentor = null as any
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
