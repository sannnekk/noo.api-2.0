import * as Hash from '@modules/Core/Security/hash'
import * as JWT from '@modules/Core/Security/jwt'
import { UnauthenticatedError } from '@modules/core/Errors/UnauthenticatedError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import { UnknownError } from '@modules/Core/Errors/UnknownError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { Service } from '@modules/Core/Services/Service'
import { EmailService } from '@modules/Core/Email/EmailService'
import { User } from '../Data/User'
import { UserRepository } from '../Data/UserRepository'
import { LoginDTO } from '../DTO/LoginDTO'
import { UserModel } from '../Data/UserModel'
import { InvalidVerificationTokenError } from '../Errors/InvalidVerificationTokenError'
import { v4 as uuid } from 'uuid'
import { RegisterDTO } from '../DTO/RegisterDTO'
import { UpdateUserDTO } from '../DTO/UpdateUserDTO'

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

	public async register(registerDTO: RegisterDTO): Promise<void> {
		// every user is a student at the moment of registration
		const user = new UserModel(registerDTO)

		user.role = 'student'
		user.verificationToken = await Hash.hash(Math.random().toString())

		const existingUsername = await this.userRepository.findOne({
			username: user.username,
		})

		if (existingUsername) {
			throw new AlreadyExistError('Этот никнейм уже занят.')
		}

		const existingEmail = await this.userRepository.findOne({
			email: user.email,
		})

		if (existingEmail) {
			throw new AlreadyExistError('Пользователь с таким email уже существует.')
		}

		await this.create(user)

		await this.emailService.sendVerificationEmail(
			user.email,
			user.username,
			user.name,
			user.verificationToken
		)
	}

	public async checkUsername(username: string): Promise<boolean> {
		const user = await this.userRepository.findOne({ username })

		return user !== null
	}

	public async verify(username: string, token: string): Promise<void> {
		const user = await this.userRepository.findOne({
			username,
		})

		if (!user) {
			throw new NotFoundError()
		}

		if (user.verificationToken !== token) {
			throw new InvalidVerificationTokenError()
		}

		user.verificationToken = null as any

		await this.userRepository.update(user)
	}

	public async verifyManual(username: string): Promise<void> {
		const user = await this.userRepository.findOne({
			username,
		})

		if (!user) {
			throw new NotFoundError()
		}

		if (!user.verificationToken) {
			throw new UnknownError('Этот аккаунт уже подтвержден.')
		}

		user.verificationToken = null as any

		await this.userRepository.update(user)
	}

	public async resendVerification(email: string): Promise<void> {
		const user = await this.userRepository.findOne({ email })

		if (!user) {
			throw new NotFoundError('Пользователь с таким email не найден.')
		}

		if (!user.verificationToken) {
			throw new UnauthenticatedError(
				'Этот аккаунт уже подтвержден. Попробуйте войти или воспользуйтесь кнопкой "Забыл пароль".'
			)
		}

		await this.emailService.sendVerificationEmail(
			user.email,
			user.username,
			user.name,
			user.verificationToken
		)
	}

	public async assignMentor(studentId: User['id'], mentorId: User['id']) {
		const student = await this.userRepository.findOne({ id: studentId })
		const mentor = await this.userRepository.findOne({ id: mentorId })

		if (!student || !mentor) {
			throw new NotFoundError()
		}

		if (student.isBlocked || mentor.isBlocked) {
			throw new UnauthenticatedError(
				'Аккаунт куратора или студента заблокирован.'
			)
		}

		student.mentor = mentorId as any

		await this.userRepository.update(student)
	}

	public async login(
		credentials: LoginDTO
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
			['mentor']
		)

		if (!user) {
			throw new UnauthenticatedError('Неверный логин или пароль')
		}

		if (!(await Hash.compare(credentials.password, user.password!))) {
			throw new UnauthenticatedError('Неверный логин или пароль.')
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

		const newPassword = uuid()

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

	public async getUsers(pagination: Pagination | undefined) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['students' as const, 'courses' as const]

		const users = await this.userRepository.find(
			undefined,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.userRepository,
			undefined,
			pagination,
			relations
		)

		return { users, meta }
	}

	public async getStudentsOf(mentorId: User['id'], pagination?: Pagination) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['students' as const]
		const conditions: any = {
			mentor: { id: mentorId } as any,
			role: 'student',
		}

		const students = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.userRepository,
			conditions,
			pagination,
			relations
		)

		return { students, meta }
	}

	public async getMentors(pagination: Pagination | undefined) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['students' as const]
		const conditions = { role: 'mentor' as const }

		const mentors = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.userRepository,
			conditions,
			pagination,
			relations
		)

		return { mentors, meta }
	}

	public async getTeachers(pagination: Pagination | undefined) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = [] as (keyof User)[]
		const conditions = { role: 'teacher' as const }

		const teachers = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.userRepository,
			conditions,
			pagination,
			relations
		)

		return { teachers, meta }
	}

	public async getStudents(pagination: Pagination | undefined) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = ['mentor' as const]
		const conditions = { role: 'student' as const }

		const students = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.userRepository,
			conditions,
			pagination,
			relations
		)

		return { students, meta }
	}

	public async update(
		id: User['id'],
		data: UpdateUserDTO,
		updaterRole: User['role']
	): Promise<void> {
		const existingUser = await this.userRepository.findOne({ id })

		if (!existingUser) {
			throw new NotFoundError()
		}

		if (data.password) data.password = await Hash.hash(data.password!)

		const user = new UserModel({
			...existingUser,
			...data,
			role: existingUser.role,
		})

		if (
			data.role &&
			data.role !== existingUser.role &&
			existingUser.role === 'student' &&
			['teacher', 'admin'].includes(updaterRole)
		) {
			user.role = data.role
		}

		const newUser = new UserModel({ ...existingUser, ...user })

		await this.userRepository.update(newUser)
	}

	public async delete(id: string): Promise<void> {
		const user = await this.userRepository.findOne({ id })

		if (!user) {
			throw new NotFoundError()
		}

		user.name = 'Deleted User'
		user.username = user.slug =
			'deleted-' + Math.random().toString(36).substr(2, 9)
		user.email =
			'deleted-' +
			Math.random().toString(36).substr(2, 9) +
			'@' +
			Math.random().toString(36).substr(2, 9) +
			'.com'
		user.isBlocked = true
		user.telegramId = null as any
		user.telegramUsername = null as any

		await this.userRepository.update(user)
	}
}
