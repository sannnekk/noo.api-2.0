import * as Hash from '@modules/Core/Security/hash'
import * as JWT from '@modules/Core/Security/jwt'
import { UnauthenticatedError } from '@modules/Core/Errors/UnauthenticatedError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import { EmailService } from '@modules/Core/Email/EmailService'
import { LoginDTO } from '../DTO/LoginDTO'
import { InvalidVerificationTokenError } from '../Errors/InvalidVerificationTokenError'
import { RegisterDTO } from '../DTO/RegisterDTO'
import { Context } from '@modules/Core/Request/Context'
import { SessionService } from '@modules/Sessions/Services/SessionService'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { User } from '@modules/Users/Data/User'
import { UserModel } from '@modules/Users/Data/UserModel'
import { NotificationService } from '@modules/Notifications/Services/NotificationService'

export class AuthService {
  private readonly userRepository: UserRepository

  private readonly emailService: EmailService

  private readonly sessionService: SessionService

  private readonly notificationService: NotificationService

  constructor() {
    this.userRepository = new UserRepository()
    this.emailService = new EmailService()
    this.sessionService = new SessionService()
    this.notificationService = new NotificationService()
  }

  public async create(user: User): Promise<void> {
    user.password = await Hash.hash(user.password!)

    await this.userRepository.create(user)
  }

  public async register(registerDTO: RegisterDTO): Promise<void> {
    // every user is a student at the moment of registration
    const user = new UserModel(registerDTO)

    user.role = 'student'
    user.verificationToken = await Hash.hash(Math.random().toString())

    const usernameExists = await this.userRepository.usernameExists(
      user.username
    )

    if (usernameExists) {
      throw new AlreadyExistError('Этот никнейм уже занят.')
    }

    const emailExists = await this.userRepository.emailExists(user.email)

    if (emailExists) {
      throw new AlreadyExistError('Пользователь с таким email уже существует.')
    }

    await this.create(user)

    await this.notificationService.generateAndSend('welcome', user.id)

    await this.emailService.sendVerificationEmail(
      user.email,
      user.username,
      user.name,
      user.verificationToken
    )
  }

  public async checkUsername(username: string): Promise<boolean> {
    return this.userRepository.usernameExists(username)
  }

  public async verify(username: string, token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      username,
    })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    if (user.verificationToken !== token) {
      throw new InvalidVerificationTokenError()
    }

    user.verificationToken = null as any

    await this.userRepository.update(user)
    await this.notificationService.generateAndSend(
      'user.email-verified',
      user.id
    )
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

  public async login(
    credentials: LoginDTO,
    context: Context
  ): Promise<{ token: JWT.JWT; payload: JWT.JWTPayload; user: Partial<User> }> {
    const user = await this.userRepository.findOne([
      {
        username: credentials.usernameOrEmail,
      },
      {
        email: credentials.usernameOrEmail,
      },
    ])

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

    let session = await this.sessionService.getCurrentSession(context, user.id)

    if (!session) {
      session = await this.sessionService.createSession(context, user.id)

      await this.notificationService.generateAndSend('user.login', user.id, {
        session,
      })
    }

    const payload: JWT.JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.forbidden || 0,
      isBlocked: user.isBlocked,
      sessionId: session.id,
    }

    return {
      token: JWT.create(payload),
      payload,
      user,
    }
  }

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ email })

    if (!user) {
      throw new NotFoundError('Пользователь с таким email не найден.')
    }

    if (user.isBlocked) {
      throw new UnauthenticatedError('Этот аккаунт заблокирован.')
    }

    if (user.verificationToken) {
      throw new UnauthenticatedError(
        'Этот аккаунт не подтвержден. Перейдите по ссылке в письме, отправленном на вашу почту, чтобы подтвердить регистрацию.'
      )
    }

    const newPassword = this.generatePassword()

    user.password = await Hash.hash(newPassword)

    await this.userRepository.update(user)

    await this.emailService.sendForgotPasswordEmail(
      user.email,
      user.name,
      newPassword
    )
  }

  /**
   * Generates a random password
   * Requirements:
   * - 12 characters
   * - 1 uppercase letter
   * - 1 lowercase letter
   * - 1 number
   */
  private generatePassword(): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'

    const characters = uppercase + lowercase + numbers

    let password = ''

    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]

    for (let i = 0; i < 9; i++) {
      password += characters[Math.floor(Math.random() * characters.length)]
    }

    return password
  }
}
