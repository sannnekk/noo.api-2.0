import type { Notification } from '../../Data/Notification'

export abstract class NotificationBus {
  public abstract notify(notifications: Notification[]): Promise<void>
}
