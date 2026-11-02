# Notifications

**In-app**, **Telegram** (sent only if the user has `telegramId` and `telegramNotificationsEnabled`)and **Web Push** (sent to every push subscription of the user)

## Notification object scheme

```ts
interface Notification {
  id: string                  // ULID
  createdAt: Date             // ISO string
  updatedAt: Date             // ISO string
  userId: string              // receiver's noo.platform user id
  title: string
  message: string | null      // may contain HTML
  link: string | null         // in-app route, for example '/assigned-works/{id}/read'
  status: 'read' | 'unread'   // default 'unread'
  type: NotificationType
  isBanner: boolean           // default false. When true, shows as a banner
}

type NotificationType =
  | 'work-made'
  | 'work-checked'
  | 'work-transferred'
  | 'poll-answered'
  | 'warning'
  | 'maintenance'
  | 'new-feature'
  | 'announcement'
  | 'welcome'
  | 'mentor-assigned'
  | 'mentor-removed'
  | 'other'
```

### Web Push payload

`WebPushBus` sends a reduced JSON (TTL 24h):

```ts
{
  id: string
  title: string
  body: string | null   // = notification.message
  link: string | null
  type: NotificationType
}
```

### Telegram message

`TelegramBus` sends HTML text: `{emoji} <b>{title}</b>\n{message}`.
Emoji by type: `announcement` 📢, `warning` ⚠️, `maintenance` 🔧, `mentor-assigned` 👤, `mentor-removed` 👤❌, `new-feature` 🆕, `poll-answered` 📊, `work-checked` / `work-made` 📝, `work-transferred` 🔄, `welcome` 👋, `other` 🔔.

## All notifications sent in the app

### System-generated (`NotificationGenerator`, sent to a single user)

| Template                                           | Triggered in                                                    | Receiver          | `type`             | Title                              | Message                                                                                      | Link                              | Banner |
| -------------------------------------------------- | --------------------------------------------------------------- | ----------------- | ------------------ | ---------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------- | ------ |
| `welcome`                                          | `AuthService` – registration                                    | new user          | `welcome`          | Добро пожаловать на НОО.Платформу! | Если вы купили платный курс, он откроется вам… (HTML, link to help article)                  | –                                 | yes    |
| `user.login`                                       | `AuthService` – login creating a new session                    | user              | `warning`          | Вход с нового устройства           | Вы вошли в аккаунт с устройства `{device}`, браузер: `{browser}`                             | –                                 | no     |
| `user.email-verified`                              | `AuthService` – email verification                              | user              | `other`            | Email подтвержден                  | Ваш email успешно подтвержден!                                                               | –                                 | no     |
| `user.email-changed`                               | **not triggered anywhere** (template exists only)               | user              | `other`            | Email изменен                      | Ваш email успешно изменен!                                                                   | –                                 | no     |
| `user.mentor-assigned-for-student`                 | `UserService.assignMentor`                                      | student           | `mentor-assigned`  | Вам назначен куратор               | Ваш новый куратор: `{mentor}` по предмету: `{subject}`                                       | –                                 | no     |
| `user.mentor-assigned-for-mentor`                  | `UserService.assignMentor`                                      | mentor            | `mentor-assigned`  | У вас новый ученик                 | Ваш новый ученик: `{student}`, предмет: `{subject}`                                          | –                                 | no     |
| `user.mentor-removed-for-student`                  | `UserService.assignMentor` (replacing) / `unassignMentor`       | student           | `mentor-removed`   | Куратор откреплен                  | Теперь `{mentor}` не является вашим куратором по предмету: `{subject}`                       | –                                 | no     |
| `user.mentor-removed-for-mentor`                   | `UserService.unassignMentor`                                    | old mentor        | `mentor-removed`   | Ученик откреплен                   | Теперь `{student}` не является вашим учеником по предмету: `{subject}`                       | –                                 | no     |
| `user.role-changed`                                | `UserService` – role change                                     | user              | `other`            | Роль изменена                      | Ваша роль успешно изменена на `{roleName}`                                                   | –                                 | no     |
| `user.telegram-updated`                            | `UserService.updateTelegram`                                    | user              | `other`            | Telegram обновлен                  | Ваш Telegram успешно обновлен!                                                               | –                                 | no     |
| `assigned-work.work-made-for-student`              | `AssignedWorkService` – work submitted                          | student           | `work-made`        | Работа сдана                       | Работа "`{work}`" успешно сдана                                                              | `/assigned-works/{id}/read`       | no     |
| `assigned-work.work-made-for-mentor`               | `AssignedWorkService` – work submitted (not auto-checked)       | each mentor       | `work-made`        | Ученик `{student}` сдал работу     | Работа: `{work}`                                                                             | `/assigned-works/{id}/check`      | no     |
| `assigned-work.work-checked-for-student`           | `AssignedWorkService` – work checked                            | student           | `work-checked`     | Работа проверена                   | Работа "`{work}`" проверена кураторами `{mentors joined by " и "}`, оценка: `{score} / {max}` | `/assigned-works/{id}/read`       | no     |
| `assigned-work.work-checked-for-mentor`            | `AssignedWorkService` – work checked                            | each mentor       | `work-checked`     | Работа проверена                   | Работа "`{work}`" ученика `{student}` проверена                                              | `/assigned-works/{id}/read`       | no     |
| `assigned-work.work-transferred-to-another-mentor` | `AssignedWorkService` – transfer to another mentor              | new mentor        | `work-transferred` | Вам передана работа                | Работа "`{work}`" ученика `{student}` передана Вам                                           | `/assigned-works/{id}/read`       | no     |
| `poll.poll-answered`                               | `PollService` – registered user answers a poll                  | user              | `poll-answered`    | Опрос пройден                      | Вы успешно прошли опрос `{poll}`                                                             | –                                 | no     |

### Manual (`POST /notification`, teacher or admin only)

Body is validated by `CreateNotificationScheme`:

```ts
{
  notification: {
    title: string
    message: string | null
    link: string | null
    type: 'maintenance' | 'new-feature' | 'announcement' | 'other'
    isBanner?: boolean            // default false
  },
  sendOptions: {
    selector: 'role' | 'course' | 'all'
    value: string | null          // role name for 'role', course id for 'course'
  }
}
```

One notification row is created for every matching user (all users / all users with the role / all students assigned to a specific course).

## Examples

### 1. Assigned work solved (`assigned-work.work-made-for-mentor`)

Sent to each mentor of the work when a student submits it (skipped if the work was checked automatically). The student at the same time gets `assigned-work.work-made-for-student` ("Работа сдана").

Stored / API object:

```json
{
  "id": "01JBCX4M7Q2T8K9V3N5R6W1Y0Z",
  "createdAt": "2026-10-25T14:32:10.123Z",
  "updatedAt": "2026-10-25T14:32:10.123Z",
  "userId": "01HZ8F3K2M4N6P8Q0R2S4T6V8X",
  "title": "Ученик Иван Петров сдал работу",
  "message": "Работа: Пробник ЕГЭ по химии №3",
  "link": "/assigned-works/01JBCX1A2B3C4D5E6F7G8H9J0K/check",
  "status": "unread",
  "type": "work-made",
  "isBanner": false
}
```

Web Push payload:

```json
{
  "id": "01JBCX4M7Q2T8K9V3N5R6W1Y0Z",
  "title": "Ученик Иван Петров сдал работу",
  "body": "Работа: Пробник ЕГЭ по химии №3",
  "link": "/assigned-works/01JBCX1A2B3C4D5E6F7G8H9J0K/check",
  "type": "work-made"
}
```

### 2. Mentor assigned (`user.mentor-assigned-for-student`)

Sent to the student when an admin/teacher assigns them a mentor for a subject.

Stored / API object:

```json
{
  "id": "01JBCY9D3F5H7K9M1P3R5T7V9X",
  "createdAt": "2026-10-25T09:05:44.512Z",
  "updatedAt": "2026-10-25T09:05:44.512Z",
  "userId": "01HZ7A1B2C3D4E5F6G7H8J9K0M",
  "title": "Вам назначен куратор",
  "message": "Ваш новый куратор: Анна Смирнова по предмету: Химия",
  "link": null,
  "status": "unread",
  "type": "mentor-assigned",
  "isBanner": false
}
```

Web Push payload:

```json
{
  "id": "01JBCY9D3F5H7K9M1P3R5T7V9X",
  "title": "Вам назначен куратор",
  "body": "Ваш новый куратор: Анна Смирнова по предмету: Химия",
  "link": null,
  "type": "mentor-assigned"
}
```
