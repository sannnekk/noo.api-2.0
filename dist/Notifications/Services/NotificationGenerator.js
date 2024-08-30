import { NotificationModel } from '../Data/NotificationModel.js';
import { UserModel } from '../../Users/Data/UserModel.js';
export class NotificationGenerator {
    welcomeNotification() {
        return new NotificationModel({
            title: 'Добро пожаловать!',
            message: 'Мы рады видеть вас на НОО.Платформе!',
            type: 'welcome',
        });
    }
    emailVerifiedNotification() {
        return new NotificationModel({
            title: 'Email подтвержден',
            message: 'Ваш email успешно подтвержден!',
            type: 'other',
        });
    }
    emailChangedNotification() {
        return new NotificationModel({
            title: 'Email изменен',
            message: 'Ваш email успешно изменен!',
            type: 'other',
        });
    }
    workMadeForStudentNotification(assignedWork) {
        return new NotificationModel({
            title: `Работа сдана`,
            message: `Работа "${assignedWork.work.name}" успешно сдана`,
            type: 'work-made',
            link: `/assigned-works/${assignedWork.id}/read`,
        });
    }
    workCheckedForStudentNotification(assignedWork) {
        return new NotificationModel({
            title: `Работа проверена`,
            message: `Работа "${assignedWork.work.name}" проверена кураторами ${assignedWork.mentors?.map((mentor) => mentor.name).join(' и ')}, оценка: ${assignedWork.score} / ${assignedWork.maxScore}`,
            type: 'work-checked',
            link: `/assigned-works/${assignedWork.id}/read`,
        });
    }
    workMadeForMentorNotification(assignedWork) {
        return new NotificationModel({
            title: `Ученик ${assignedWork.student.name} сдал работу`,
            message: `Работа: ${assignedWork.work.name}`,
            type: 'work-made',
            link: `/assigned-works/${assignedWork.id}/check`,
        });
    }
    workCheckedForMentorNotification(assignedWork) {
        return new NotificationModel({
            title: `Работа проверена`,
            message: `Работа "${assignedWork.work.name}" ученика ${assignedWork.student.name} проверена`,
            type: 'work-checked',
            link: `/assigned-works/${assignedWork.id}/read`,
        });
    }
    workTransferredToAnotherMentorNotification(assignedWork) {
        return new NotificationModel({
            title: `Вам передана работа`,
            message: `Работа "${assignedWork.work.name}" ученика ${assignedWork.student.name} передана Вам`,
            type: 'work-transferred',
            link: `/assigned-works/${assignedWork.id}/read`,
        });
    }
    pollAnsweredNotification(poll) {
        return new NotificationModel({
            title: `Опрос пройден`,
            message: `Вы успешно прошли опрос ${poll.title}`,
            type: 'poll-answered',
        });
    }
    loginNotification(session) {
        return new NotificationModel({
            title: 'Вход с нового устройства',
            message: `Вы вошли в аккаунт с устройства ${session.device}, браузер: ${session.browser}`,
            type: 'warning',
        });
    }
    mentorAssignedForStudentNotification(mentor, subject) {
        return new NotificationModel({
            title: `Вам назначен куратор`,
            message: `Ваш новый куратор: ${mentor.name} gо предмету: ${subject.name}`,
            type: 'mentor-assigned',
        });
    }
    mentorAssignedForMentorNotification(student, subject) {
        return new NotificationModel({
            title: `У вас новый ученик`,
            message: `Ваш новый ученик: ${student.name}, предмет: ${subject.name}`,
            type: 'mentor-assigned',
        });
    }
    mentorRemovedForStudentNotification(mentor, subject) {
        return new NotificationModel({
            title: `Куратор откреплен`,
            message: `Теперь ${mentor.name} не является вашим куратором по предмету: ${subject.name}`,
            type: 'mentor-removed',
        });
    }
    mentorRemovedForMentorNotification(student, subject) {
        return new NotificationModel({
            title: `Ученик откреплен`,
            message: `Теперь ${student.name} не является вашим учеником по предмету: ${subject.name}`,
            type: 'mentor-removed',
        });
    }
    telegramUpdatedNotification() {
        return new NotificationModel({
            title: 'Telegram обновлен',
            message: 'Ваш Telegram успешно обновлен!',
            type: 'other',
        });
    }
    roleChangedNotification(newRole) {
        return new NotificationModel({
            title: 'Роль изменена',
            message: `Ваша роль успешно изменена на ${UserModel.getRoleName(newRole)}`,
            type: 'other',
        });
    }
}
