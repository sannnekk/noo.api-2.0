import * as Hash from '@modules/Core/Security/hash'
import { UnauthenticatedError } from '@modules/Core/Errors/UnauthenticatedError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { Service } from '@modules/Core/Services/Service'
import { EmailService } from '@modules/Core/Email/EmailService'
import { User } from '../Data/User'
import { UserRepository } from '../Data/UserRepository'
import { UserModel } from '../Data/UserModel'
import { UpdateUserDTO } from '../DTO/UpdateUserDTO'
import { UpdateTelegramDTO } from '../DTO/UpdateTelegramDTO'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'

export class UserService extends Service<User> {
  private readonly userRepository: UserRepository

  private readonly emailService: EmailService

  constructor() {
    super()

    this.userRepository = new UserRepository()
    this.emailService = new EmailService()
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

    const relations: (keyof User)[] = ['students', 'courses']

    if (pagination.relationsToLoad.includes('mentor')) {
      relations.push('mentor')
    }

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

    if (data.password) data.password = await Hash.hash(data.password)

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

  public async updateTelegram(
    id: User['id'],
    data: UpdateTelegramDTO
  ): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    user.telegramId = data.telegramId
    user.telegramUsername = data.telegramUsername
    user.telegramAvatarUrl = data.telegramAvatarUrl

    await this.userRepository.update(user)
  }

  public async sendEmailUpdate(id: User['id'], newEmail: User['email']) {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    const existingEmail = await this.userRepository.findOne({
      email: user.newEmail,
    })

    if (existingEmail) {
      throw new AlreadyExistError('Аккаунт с такой почтой уже существует.')
    }

    if (user.email === newEmail) {
      return
    }

    user.newEmail = newEmail

    const emailChangeToken = await this.getChangeEmailToken(user)

    await this.emailService.sendEmailChangeConfirmation(
      user.name,
      newEmail,
      user.username,
      emailChangeToken
    )
    await this.userRepository.update(user)
  }

  public async confirmEmailUpdate(username: string, token: string) {
    const user = await this.userRepository.findOne({ username })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    if (!user.newEmail) {
      throw new UnauthenticatedError('Смена почты не запрошена.')
    }

    const emailChangeToken = await this.getChangeEmailToken(user)

    if (emailChangeToken !== token) {
      throw new UnauthenticatedError('Неверный токен.')
    }

    user.email = user.newEmail
    user.newEmail = null as any

    await this.userRepository.update(user)
  }

  public async delete(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError()
    }

    user.name = 'Deleted User'
    user.username = user.slug = `deleted-${Math.random()
      .toString(36)
      .substr(2, 9)}`
    user.email = `deleted-${Math.random()
      .toString(36)
      .substr(2, 9)}@${Math.random().toString(36).substr(2, 9)}.com`
    user.isBlocked = true
    user.telegramId = null as any
    user.telegramUsername = null as any
    user.telegramAvatarUrl = ''
    user.mentor = null as any
    user.students = []
    user.courses = []

    await this.userRepository.update(user)
  }

  private async getChangeEmailToken(user: User) {
    if (!user.newEmail) {
      return '-'
    }

    return Hash.hash(`${user.id}${user.email}${user.newEmail}`)
  }
}
