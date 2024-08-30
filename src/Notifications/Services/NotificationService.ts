import { Pagination } from '@modules/Core/Data/Pagination'
import { User } from '@modules/Users/Data/User'
import { NotificationRepository } from '../Data/NotificationRepostiory'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Notification } from '../Data/Notification'
import { NotificationSendOptions } from '../types/NotificationSendOptions'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import {
  NotificationGenerator,
  NotificationTemplate,
} from './NotificationGenerator'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Poll } from '@modules/Polls/Data/Poll'
import { Session } from '@modules/Sessions/Data/Session'
import { Subject } from '@modules/Subjects/Data/Subject'
import { TelegramBus } from './NotificationBuses/TelegramBus'
import { NotificationBus } from './NotificationBuses/NotificationBus'

export type NotificationPayload = {
  assignedWork?: AssignedWork
  poll?: Poll
  session?: Session
  student?: User
  mentor?: User
  subject?: Subject
  newRole?: User['role']
}

export class NotificationService {
  private readonly notificationRepository: NotificationRepository

  private readonly userRepository: UserRepository

  private readonly generator: NotificationGenerator

  private readonly buses: NotificationBus[] = []

  constructor() {
    this.notificationRepository = new NotificationRepository()
    this.userRepository = new UserRepository()
    this.generator = new NotificationGenerator()

    // add buses
    this.buses.push(new TelegramBus())
  }

  public async getAll(userId: User['id'], pagination: Pagination) {
    return this.notificationRepository.search(
      { user: { id: userId } },
      pagination
    )
  }

  public async getRead(userId: User['id'], pagination: Pagination) {
    return this.notificationRepository.search(
      { user: { id: userId }, status: 'read' },
      pagination
    )
  }

  public async getUnread(userId: User['id']): Promise<Notification[]> {
    return this.notificationRepository.findAll(
      { user: { id: userId }, status: 'unread' },
      undefined,
      { createdAt: 'DESC' }
    )
  }

  public async getUnreadCount(userId: User['id']): Promise<number> {
    return this.notificationRepository.countUnread(userId)
  }

  public async markAllAsRead(userId: User['id']) {
    return this.notificationRepository.markAllAsRead(userId)
  }

  public async create(
    notification: Notification,
    sendOptions: NotificationSendOptions
  ) {
    const notifications = await this.prepareNotifications(
      notification,
      sendOptions
    )

    const savedNotifications =
      await this.notificationRepository.createMany(notifications)

    await this.notificationRepository.addUserRelation(savedNotifications)

    for (const bus of this.buses) {
      await bus.notify(savedNotifications)
    }
  }

  public async generateAndSend(
    template: NotificationTemplate,
    receiverId: User['id'],
    payload?: NotificationPayload
  ) {
    let notification: Notification

    switch (template) {
      case 'welcome':
        notification = this.generator.welcomeNotification()
        break
      case 'user.login':
        notification = this.generator.loginNotification(payload!.session!)
        break
      case 'user.mentor-assigned-for-mentor':
        notification = this.generator.mentorAssignedForMentorNotification(
          payload!.student!,
          payload!.subject!
        )
        break
      case 'user.mentor-assigned-for-student':
        notification = this.generator.mentorAssignedForStudentNotification(
          payload!.mentor!,
          payload!.subject!
        )
        break
      case 'user.mentor-removed-for-mentor':
        notification = this.generator.mentorRemovedForMentorNotification(
          payload!.student!,
          payload!.subject!
        )
        break
      case 'user.mentor-removed-for-student':
        notification = this.generator.mentorRemovedForStudentNotification(
          payload!.mentor!,
          payload!.subject!
        )
        break
      case 'user.email-verified':
        notification = this.generator.emailVerifiedNotification()
        break
      case 'user.email-changed':
        notification = this.generator.emailChangedNotification()
        break
      case 'user.role-changed':
        notification = this.generator.roleChangedNotification(payload!.newRole!)
        break
      case 'user.telegram-updated':
        notification = this.generator.telegramUpdatedNotification()
        break
      case 'assigned-work.work-made-for-student':
        notification = this.generator.workMadeForStudentNotification(
          payload!.assignedWork!
        )
        break
      case 'assigned-work.work-made-for-mentor':
        notification = this.generator.workMadeForMentorNotification(
          payload!.assignedWork!
        )
        break
      case 'assigned-work.work-checked-for-student':
        notification = this.generator.workCheckedForStudentNotification(
          payload!.assignedWork!
        )
        break
      case 'assigned-work.work-checked-for-mentor':
        notification = this.generator.workCheckedForMentorNotification(
          payload!.assignedWork!
        )
        break
      case 'assigned-work.work-transferred-to-another-mentor':
        notification =
          this.generator.workTransferredToAnotherMentorNotification(
            payload!.assignedWork!
          )
        break
      case 'poll.poll-answered':
        notification = this.generator.pollAnsweredNotification(payload!.poll!)
        break
      default:
        return
    }

    await this.create(notification, {
      selector: 'user',
      value: receiverId,
    })
  }

  public async delete(id: string, userId: User['id']) {
    const notification = await this.notificationRepository.findOne({
      id,
      user: { id: userId },
    })

    if (!notification) {
      throw new NotFoundError('Уведомление не найдено')
    }

    await this.notificationRepository.delete(notification.id)
  }

  private async prepareNotifications(
    notification: Notification,
    sendOptions: NotificationSendOptions
  ): Promise<Notification[]> {
    switch (sendOptions.selector) {
      case 'all':
        return this.prepareNotificationForAllUsers(notification)
      case 'role':
        return this.prepareNotificationForRole(
          notification,
          sendOptions.value as User['role']
        )
      case 'course':
        return this.prepareNotificationForCourseStudents(
          notification,
          sendOptions.value!
        )
      case 'user':
        return this.prepareNotificationForUser(notification, sendOptions.value!)
    }
  }

  private async prepareNotificationForAllUsers(
    notification: Notification
  ): Promise<Notification[]> {
    const userIds = await this.userRepository.findIds()

    return userIds.map((userId) => ({
      ...notification,
      user: {
        id: userId,
      } as User,
    }))
  }

  private async prepareNotificationForUser(
    notification: Notification,
    userId: User['id']
  ) {
    return [{ ...notification, user: { id: userId } as User }]
  }

  private async prepareNotificationForRole(
    notification: Notification,
    roleName: User['role']
  ) {
    const userIds = await this.userRepository.findIds({ role: roleName })

    return userIds.map((userId) => ({
      ...notification,
      user: {
        id: userId,
      } as User,
    }))
  }

  private async prepareNotificationForCourseStudents(
    notification: Notification,
    courseId: string
  ) {
    const userIds = await this.userRepository.findIds({
      coursesAsStudent: { id: courseId },
    })

    return userIds.map((userId) => ({
      ...notification,
      user: {
        id: userId,
      } as User,
    }))
  }
}
