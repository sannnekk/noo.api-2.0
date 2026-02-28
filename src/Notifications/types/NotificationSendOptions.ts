export type NotificationSendOptions = {
  selector: 'role' | 'course' | 'all' | 'user'
  value: null | string // role name or course id
}
