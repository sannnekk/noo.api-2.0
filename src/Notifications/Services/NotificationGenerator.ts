import { NotificationModel } from '../Data/NotificationModel'
import { type Notification } from '../Data/Notification'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Poll } from '@modules/Polls/Data/Poll'
import { Session } from '@modules/Sessions/Data/Session'
import { User } from '@modules/Users/Data/User'
import { Subject } from '@modules/Subjects/Data/Subject'
import { UserModel } from '@modules/Users/Data/UserModel'

export type NotificationTemplate =
  | 'welcome'
  | 'user.login'
  | 'user.email-verified'
  | 'user.email-changed'
  | 'user.mentor-assigned-for-student'
  | 'user.mentor-assigned-for-mentor'
  | 'user.mentor-removed-for-student'
  | 'user.mentor-removed-for-mentor'
  | 'user.telegram-updated'
  | 'user.role-changed'
  | 'assigned-work.work-made-for-student'
  | 'assigned-work.work-made-for-mentor'
  | 'assigned-work.work-checked-for-student'
  | 'assigned-work.work-checked-for-mentor'
  | 'assigned-work.work-transferred-to-another-mentor'
  | 'poll.poll-answered'

export class NotificationGenerator {
  public welcomeNotification(): Notification {
    return new NotificationModel({
      title: 'Добро пожаловать!',
      message: 'Мы рады видеть вас на НОО.Платформе!',
      type: 'welcome',
    })
  }

  public emailVerifiedNotification(): Notification {
    return new NotificationModel({
      title: 'Email подтвержден',
      message: 'Ваш email успешно подтвержден!',
      type: 'other',
    })
  }

  public emailChangedNotification(): Notification {
    return new NotificationModel({
      title: 'Email изменен',
      message: 'Ваш email успешно изменен!',
      type: 'other',
    })
  }

  public workMadeForStudentNotification(
    assignedWork: AssignedWork
  ): Notification {
    return new NotificationModel({
      title: `Работа сдана`,
      message: `Работа "${assignedWork.work.name}" успешно сдана`,
      type: 'work-made',
      link: `/assigned-works/${assignedWork.id}/read`,
    })
  }

  public workCheckedForStudentNotification(
    assignedWork: AssignedWork
  ): Notification {
    return new NotificationModel({
      title: `Работа проверена`,
      message: `Работа "${assignedWork.work.name}" проверена кураторами ${assignedWork.mentors?.map((mentor) => mentor.name).join(' и ')}, оценка: ${assignedWork.score} / ${assignedWork.maxScore}`,
      type: 'work-checked',
      link: `/assigned-works/${assignedWork.id}/read`,
    })
  }

  public workMadeForMentorNotification(
    assignedWork: AssignedWork
  ): Notification {
    return new NotificationModel({
      title: `Ученик ${assignedWork.student!.name} сдал работу`,
      message: `Работа: ${assignedWork.work.name}`,
      type: 'work-made',
      link: `/assigned-works/${assignedWork.id}/check`,
    })
  }

  public workCheckedForMentorNotification(
    assignedWork: AssignedWork
  ): Notification {
    return new NotificationModel({
      title: `Работа проверена`,
      message: `Работа "${assignedWork.work.name}" ученика ${assignedWork.student!.name} проверена`,
      type: 'work-checked',
      link: `/assigned-works/${assignedWork.id}/read`,
    })
  }

  public workTransferredToAnotherMentorNotification(
    assignedWork: AssignedWork
  ): Notification {
    return new NotificationModel({
      title: `Вам передана работа`,
      message: `Работа "${assignedWork.work.name}" ученика ${assignedWork.student!.name} передана Вам`,
      type: 'work-transferred',
      link: `/assigned-works/${assignedWork.id}/read`,
    })
  }

  public pollAnsweredNotification(poll: Poll): Notification {
    return new NotificationModel({
      title: `Опрос пройден`,
      message: `Вы успешно прошли опрос ${poll.title}`,
      type: 'poll-answered',
    })
  }

  public loginNotification(session: Session): Notification {
    return new NotificationModel({
      title: 'Вход с нового устройства',
      message: `Вы вошли в аккаунт с устройства ${session.device}, браузер: ${session.browser}`,
      type: 'warning',
    })
  }

  public mentorAssignedForStudentNotification(
    mentor: User,
    subject: Subject
  ): Notification {
    return new NotificationModel({
      title: `Вам назначен куратор`,
      message: `Ваш новый куратор: ${mentor.name} gо предмету: ${subject.name}`,
      type: 'mentor-assigned',
    })
  }

  public mentorAssignedForMentorNotification(
    student: User,
    subject: Subject
  ): Notification {
    return new NotificationModel({
      title: `У вас новый ученик`,
      message: `Ваш новый ученик: ${student.name}, предмет: ${subject.name}`,
      type: 'mentor-assigned',
    })
  }

  public mentorRemovedForStudentNotification(
    mentor: User,
    subject: Subject
  ): Notification {
    return new NotificationModel({
      title: `Куратор откреплен`,
      message: `Теперь ${mentor.name} не является вашим куратором по предмету: ${subject.name}`,
      type: 'mentor-removed',
    })
  }

  public mentorRemovedForMentorNotification(
    student: User,
    subject: Subject
  ): Notification {
    return new NotificationModel({
      title: `Ученик откреплен`,
      message: `Теперь ${student.name} не является вашим учеником по предмету: ${subject.name}`,
      type: 'mentor-removed',
    })
  }

  public telegramUpdatedNotification(): Notification {
    return new NotificationModel({
      title: 'Telegram обновлен',
      message: 'Ваш Telegram успешно обновлен!',
      type: 'other',
    })
  }

  public roleChangedNotification(newRole: User['role']): Notification {
    return new NotificationModel({
      title: 'Роль изменена',
      message: `Ваша роль успешно изменена на ${UserModel.getRoleName(newRole)}`,
      type: 'other',
    })
  }
}
