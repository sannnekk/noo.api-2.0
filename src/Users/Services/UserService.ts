import * as Hash from '@modules/Core/Security/hash'
import { UnauthenticatedError } from '@modules/Core/Errors/UnauthenticatedError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { EmailService } from '@modules/Core/Email/EmailService'
import { User } from '../Data/User'
import { UserRepository } from '../Data/UserRepository'
import { UserModel } from '../Data/UserModel'
import { UpdateUserDTO } from '../DTO/UpdateUserDTO'
import { UpdateTelegramDTO } from '../DTO/UpdateTelegramDTO'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import {
  OnlineStatus,
  SessionService,
} from '@modules/Sessions/Services/SessionService'
import { UserAvatarModel } from '../Data/Relations/UserAvatarModel'
import { Subject } from '@modules/Subjects/Data/Subject'
import { MentorAssignmentRepository } from '../Data/MentorAssignmentRepository'
import { FindOptionsWhere } from 'typeorm'
import TypeORM from 'typeorm'
import { MentorAssignmentModel } from '../Data/Relations/MentorAssignmentModel'
import { SubjectRepository } from '@modules/Subjects/Data/SubjectRepository'
import { PasswordUpdateDTO } from '../DTO/PasswordUpdateDTO'
import { CantChangeRoleError } from '../Errors/CantChangeRoleError'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { TransferAssignedWorkService } from '@modules/AssignedWorks/Services/TransferAssignedWorkService'
import { NotificationService } from '@modules/Notifications/Services/NotificationService'
import { CourseAssignmentRepository } from '@modules/Courses/Data/CourseAssignmentRepository'

export class UserService {
  private readonly userRepository: UserRepository

  private readonly emailService: EmailService

  private readonly sessionService: SessionService

  private readonly mentorAssignmentRepository: MentorAssignmentRepository

  private readonly subjectRepository: SubjectRepository

  private readonly transferAssignedWorkService: TransferAssignedWorkService

  private readonly notificationService: NotificationService

  private readonly courseAssignmentRepository: CourseAssignmentRepository

  constructor() {
    this.userRepository = new UserRepository()
    this.emailService = new EmailService()
    this.sessionService = new SessionService()
    this.mentorAssignmentRepository = new MentorAssignmentRepository()
    this.subjectRepository = new SubjectRepository()
    this.transferAssignedWorkService = new TransferAssignedWorkService()
    this.notificationService = new NotificationService()
    this.courseAssignmentRepository = new CourseAssignmentRepository()
  }

  public async assignMentor(
    studentId: User['id'],
    mentorId: User['id'],
    subjectId: Subject['id']
  ) {
    const student = await this.userRepository.findOne({
      id: studentId,
      role: 'student',
    })
    const mentor = await this.userRepository.findOne({
      id: mentorId,
      role: 'mentor',
    })
    const subject = await this.subjectRepository.findOne({ id: subjectId })

    if (!student || !mentor) {
      throw new NotFoundError('Ученик или куратор не найден.')
    }

    if (!subject) {
      throw new NotFoundError('Предмет не найден.')
    }

    if (student.isBlocked || mentor.isBlocked) {
      throw new UnauthenticatedError(
        'Аккаунт куратора или ученика заблокирован.'
      )
    }

    let mentorAssignment = await this.mentorAssignmentRepository.findOne(
      {
        student: { id: studentId },
        subject: { id: subjectId },
      },
      ['student', 'mentor', 'subject']
    )

    if (!mentorAssignment) {
      mentorAssignment = new MentorAssignmentModel({
        student,
        mentor,
        subject,
      })

      await this.mentorAssignmentRepository.create(mentorAssignment)
    } else {
      const oldMentor = mentorAssignment.mentor
      mentorAssignment.mentor = mentor

      await this.mentorAssignmentRepository.updateRaw(mentorAssignment)
      await this.notificationService.generateAndSend(
        'user.mentor-removed-for-student',
        student.id,
        { mentor: oldMentor, subject }
      )
    }

    await this.notificationService.generateAndSend(
      'user.mentor-assigned-for-student',
      student.id,
      { mentor, subject }
    )
    await this.notificationService.generateAndSend(
      'user.mentor-assigned-for-mentor',
      mentor.id,
      { student, subject }
    )

    await this.transferAssignedWorkService.transferNotCheckedWorks(
      student,
      mentor,
      subject
    )
  }

  public async unassignMentor(studentId: User['id'], subjectId: Subject['id']) {
    const mentorAssignment = await this.mentorAssignmentRepository.findOne(
      {
        student: { id: studentId },
        subject: { id: subjectId },
      },
      ['student', 'mentor', 'subject']
    )

    if (!mentorAssignment) {
      throw new NotFoundError('Куратор не найден.')
    }

    await this.mentorAssignmentRepository.delete(mentorAssignment.id)

    await this.notificationService.generateAndSend(
      'user.mentor-removed-for-student',
      studentId,
      { mentor: mentorAssignment.mentor, subject: mentorAssignment.subject }
    )

    await this.notificationService.generateAndSend(
      'user.mentor-removed-for-mentor',
      mentorAssignment.mentor.id,
      { student: mentorAssignment.student, subject: mentorAssignment.subject }
    )
  }

  public async getByUsername(username: string): Promise<User & OnlineStatus> {
    const user = await this.userRepository.findOne(
      { username },
      [
        'courses',
        'avatar',
        'mentorAssignmentsAsMentor',
        'mentorAssignmentsAsMentor.student',
        'mentorAssignmentsAsMentor.mentor',
        'mentorAssignmentsAsMentor.subject',
        'mentorAssignmentsAsStudent.student',
        'mentorAssignmentsAsStudent.mentor',
        'mentorAssignmentsAsStudent.subject',
      ],
      undefined,
      {
        relationLoadStrategy: 'query',
      }
    )

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    const onlineStatus = await this.sessionService.getOnlineStatus(user.id)

    return {
      ...user,
      ...onlineStatus,
      password: undefined,
    }
  }

  public async getUsers(pagination: Pagination | undefined) {
    const relations: (keyof User)[] = []

    if (pagination?.relationsToLoad.includes('mentorAssignmentsAsStudent')) {
      relations.push('mentorAssignmentsAsStudent')
      relations.push('mentorAssignmentsAsStudent.subject' as keyof User)
      relations.push('mentorAssignmentsAsStudent.mentor' as keyof User)
    }

    return this.userRepository.search(undefined, pagination, relations)
  }

  public async getStudentsOf(mentorId: User['id'], pagination?: Pagination) {
    const { entities: mentorAssignations, meta } =
      await this.mentorAssignmentRepository.search(
        {
          mentor: { id: mentorId },
          student: { id: TypeORM.Not(TypeORM.IsNull()) },
        },
        pagination,
        ['student', 'subject']
      )

    const students = mentorAssignations.map((mentorAssignment) => ({
      ...mentorAssignment.student,
      subject: mentorAssignment.subject,
    }))

    return { entities: students, meta }
  }

  public async getMentors(pagination: Pagination | undefined) {
    return this.userRepository.search({ role: 'mentor' }, pagination)
  }

  public async getTeachers(pagination: Pagination | undefined) {
    return this.userRepository.search({ role: 'teacher' }, pagination)
  }

  public async getStudents(pagination: Pagination | undefined) {
    return this.userRepository.search({ role: 'student' as const }, pagination)
  }

  public async getMentor(
    student: User,
    subjectId: Subject['id']
  ): Promise<User | null> {
    if (student.role !== 'student') {
      return null
    }

    const mentorAssignmentsAsStudent =
      await this.mentorAssignmentRepository.findOne(
        {
          student: { id: student.id },
          subject: { id: subjectId },
        },
        ['mentor']
      )

    if (!mentorAssignmentsAsStudent) {
      return null
    }

    return mentorAssignmentsAsStudent.mentor
  }

  public async update(id: User['id'], data: UpdateUserDTO): Promise<void> {
    const existingUser = await this.userRepository.findOne({ id })

    if (!existingUser) {
      throw new NotFoundError()
    }

    const user = new UserModel({
      ...existingUser,
      ...data,
    })

    await this.userRepository.update(user)
  }

  public async changePassword(
    id: User['id'],
    passwordDTO: PasswordUpdateDTO,
    role: User['role']
  ): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    if (['student', 'mentor'].includes(role)) {
      if (!passwordDTO.oldPassword) {
        throw new UnauthorizedError('Старый пароль неверный')
      }

      if (!(await Hash.compare(passwordDTO.oldPassword, user.password!))) {
        throw new UnauthorizedError('Неверный пароль.')
      }
    }

    user.password = await Hash.hash(passwordDTO.newPassword)

    await this.userRepository.update(user)
  }

  public async changeRole(id: User['id'], role: User['role']): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    if (user.role !== 'student') {
      throw new CantChangeRoleError()
    }

    const mentorAssignment = await this.mentorAssignmentRepository.findOne({
      student: { id: user.id },
    })

    if (mentorAssignment) {
      throw new CantChangeRoleError(
        'Нельзя изменить роль ученика, у которого есть куратор. Сначала открепите куратора.'
      )
    }

    const courseAssignment = await this.courseAssignmentRepository.findOne({
      student: { id: user.id },
    })

    if (courseAssignment) {
      throw new CantChangeRoleError(
        'Нельзя изменить роль ученика, который засписан хотя бы на один курс. Сначала открепите ученика со всех курсов.'
      )
    }

    user.role = role

    await this.userRepository.update(user)
    await this.sessionService.deleteSessionsForUser(user.id)

    await this.notificationService.generateAndSend(
      'user.role-changed',
      user.id,
      { newRole: role }
    )
  }

  public async updateTelegram(
    id: User['id'],
    data: UpdateTelegramDTO
  ): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    user.telegramId = data.telegramId || null
    user.telegramUsername = data.telegramUsername

    if (!user.avatar && data.telegramAvatarUrl) {
      user.avatar = new UserAvatarModel({
        avatarType: 'telegram',
        telegramAvatarUrl: data.telegramAvatarUrl,
      })
    } else if (user.avatar && data.telegramAvatarUrl) {
      user.avatar.telegramAvatarUrl = data.telegramAvatarUrl
    }

    await this.userRepository.update(user)

    await this.notificationService.generateAndSend(
      'user.telegram-updated',
      user.id
    )
  }

  public async block(id: User['id']): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    user.isBlocked = true

    await this.userRepository.update(user)
    await this.sessionService.deleteSessionsForUser(user.id)
  }

  public async unblock(id: User['id']): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    user.isBlocked = false

    await this.userRepository.update(user)
  }

  public async sendEmailUpdate(id: User['id'], newEmail: User['email']) {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    const existingEmail = await this.userRepository.findOne({
      email: newEmail,
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

  public async cancelEmailUpdate(id: User['id']) {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    user.newEmail = null

    await this.userRepository.update(user)
  }

  public async verifyManual(username: User['username']): Promise<void> {
    const user = await this.userRepository.findOne({ username })

    if (!user) {
      throw new NotFoundError()
    }

    user.verificationToken = null as any

    await this.userRepository.update(user)
  }

  public async confirmEmailUpdate(username: string, token: string) {
    const user = await this.userRepository.findOne({ username })

    if (!user) {
      throw new NotFoundError('Пользователь не найден.')
    }

    if (!user.newEmail) {
      throw new NotFoundError('Смена почты не запрошена.')
    }

    if (!(await this.verifyChangeEmailToken(user, token))) {
      throw new UnauthorizedError('Неверный токен.')
    }

    user.email = user.newEmail
    user.newEmail = null as any

    await this.userRepository.update(user)
  }

  public async delete(id: string, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ id })

    if (!user) {
      throw new NotFoundError()
    }

    if (!(await Hash.compare(password, user.password!))) {
      throw new UnauthorizedError('Неверный пароль.')
    }

    await this.mentorAssignmentRepository.deleteFromStudent(user.id)
    await this.courseAssignmentRepository.deleteFromStudent(user.id)

    // remove everything except works
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
    user.avatar = null as any
    user.courses = []
    user.courseAssignments = []
    user.votedPolls = []
    user.newEmail = null as any
    user.verificationToken = null as any
    user.sessions = []

    await this.userRepository.update(user)

    await this.removeAssociatedMentorAssignments(user)
  }

  private async getChangeEmailToken(user: User) {
    if (!user.newEmail) {
      return '-'
    }

    return Hash.hash(`${user.id}${user.email}${user.newEmail}`)
  }

  private async verifyChangeEmailToken(user: User, token: string) {
    if (!user.newEmail) {
      return false
    }

    return Hash.compare(`${user.id}${user.email}${user.newEmail}`, token)
  }

  private async removeAssociatedMentorAssignments(user: User) {
    const conditions: FindOptionsWhere<MentorAssignmentModel>[] = [
      { student: { id: user.id } },
      { mentor: { id: user.id } },
    ]

    const { entities: assignments } =
      await this.mentorAssignmentRepository.find(conditions)

    for (const assignment of assignments) {
      await this.mentorAssignmentRepository.delete(assignment.id)
    }
  }
}
