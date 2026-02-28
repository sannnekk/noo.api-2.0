import { NotificationSendOptions } from '../types/NotificationSendOptions'
import { Notification } from '../Data/Notification'

export interface NotoficationCreationDTO {
  notification: Notification
  sendOptions: NotificationSendOptions
}
