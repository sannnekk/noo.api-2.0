import { NotificationRepository } from '../Data/NotificationRepostiory.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { NotificationGenerator, } from './NotificationGenerator.js';
import { TelegramBus } from './NotificationBuses/TelegramBus.js';
export class NotificationService {
    notificationRepository;
    userRepository;
    generator;
    buses = [];
    constructor() {
        this.notificationRepository = new NotificationRepository();
        this.userRepository = new UserRepository();
        this.generator = new NotificationGenerator();
        // add buses
        this.buses.push(new TelegramBus());
    }
    async getAll(userId, pagination) {
        return this.notificationRepository.search({ user: { id: userId } }, pagination);
    }
    async getRead(userId, pagination) {
        return this.notificationRepository.search({ user: { id: userId }, status: 'read' }, pagination);
    }
    async getUnread(userId) {
        return this.notificationRepository.findAll({ user: { id: userId }, status: 'unread' }, undefined, { createdAt: 'DESC' });
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.countUnread(userId);
    }
    async markAllAsRead(userId) {
        return this.notificationRepository.markAllAsRead(userId);
    }
    async create(notification, sendOptions) {
        const notifications = await this.prepareNotifications(notification, sendOptions);
        const savedNotifications = await this.notificationRepository.createMany(notifications);
        await this.notificationRepository.addUserRelation(savedNotifications);
        for (const bus of this.buses) {
            await bus.notify(savedNotifications);
        }
    }
    async generateAndSend(template, receiverId, payload) {
        let notification;
        switch (template) {
            case 'welcome':
                notification = this.generator.welcomeNotification();
                break;
            case 'user.login':
                notification = this.generator.loginNotification(payload.session);
                break;
            case 'user.mentor-assigned-for-mentor':
                notification = this.generator.mentorAssignedForMentorNotification(payload.student, payload.subject);
                break;
            case 'user.mentor-assigned-for-student':
                notification = this.generator.mentorAssignedForStudentNotification(payload.mentor, payload.subject);
                break;
            case 'user.mentor-removed-for-mentor':
                notification = this.generator.mentorRemovedForMentorNotification(payload.student, payload.subject);
                break;
            case 'user.mentor-removed-for-student':
                notification = this.generator.mentorRemovedForStudentNotification(payload.mentor, payload.subject);
                break;
            case 'user.email-verified':
                notification = this.generator.emailVerifiedNotification();
                break;
            case 'user.email-changed':
                notification = this.generator.emailChangedNotification();
                break;
            case 'user.role-changed':
                notification = this.generator.roleChangedNotification(payload.newRole);
                break;
            case 'user.telegram-updated':
                notification = this.generator.telegramUpdatedNotification();
                break;
            case 'assigned-work.work-made-for-student':
                notification = this.generator.workMadeForStudentNotification(payload.assignedWork);
                break;
            case 'assigned-work.work-made-for-mentor':
                notification = this.generator.workMadeForMentorNotification(payload.assignedWork);
                break;
            case 'assigned-work.work-checked-for-student':
                notification = this.generator.workCheckedForStudentNotification(payload.assignedWork);
                break;
            case 'assigned-work.work-checked-for-mentor':
                notification = this.generator.workCheckedForMentorNotification(payload.assignedWork);
                break;
            case 'assigned-work.work-transferred-to-another-mentor':
                notification =
                    this.generator.workTransferredToAnotherMentorNotification(payload.assignedWork);
                break;
            case 'poll.poll-answered':
                notification = this.generator.pollAnsweredNotification(payload.poll);
                break;
            default:
                return;
        }
        await this.create(notification, {
            selector: 'user',
            value: receiverId,
        });
    }
    async delete(id, userId) {
        const notification = await this.notificationRepository.findOne({
            id,
            user: { id: userId },
        });
        if (!notification) {
            throw new NotFoundError('Уведомление не найдено');
        }
        await this.notificationRepository.delete(notification.id);
    }
    async prepareNotifications(notification, sendOptions) {
        switch (sendOptions.selector) {
            case 'all':
                return this.prepareNotificationForAllUsers(notification);
            case 'role':
                return this.prepareNotificationForRole(notification, sendOptions.value);
            case 'course':
                return this.prepareNotificationForCourseStudents(notification, sendOptions.value);
            case 'user':
                return this.prepareNotificationForUser(notification, sendOptions.value);
        }
    }
    async prepareNotificationForAllUsers(notification) {
        const userIds = await this.userRepository.findIds();
        return userIds.map((userId) => ({
            ...notification,
            user: {
                id: userId,
            },
        }));
    }
    async prepareNotificationForUser(notification, userId) {
        return [{ ...notification, user: { id: userId } }];
    }
    async prepareNotificationForRole(notification, roleName) {
        const userIds = await this.userRepository.findIds({ role: roleName });
        return userIds.map((userId) => ({
            ...notification,
            user: {
                id: userId,
            },
        }));
    }
    async prepareNotificationForCourseStudents(notification, courseId) {
        const userIds = await this.userRepository.findIds({
            coursesAsStudent: { id: courseId },
        });
        return userIds.map((userId) => ({
            ...notification,
            user: {
                id: userId,
            },
        }));
    }
}
