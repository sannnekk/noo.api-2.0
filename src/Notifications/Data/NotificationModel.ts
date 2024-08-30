import { Model } from '@modules/Core/Data/Model'
import { Notification, NotificationType } from './Notification'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'

@Entity('notification')
export class NotificationModel extends Model implements Notification {
  public constructor(data?: Partial<Notification>) {
    super()

    if (data) {
      this.set(data)

      if (!data.status) {
        this.status = 'unread'
      }

      if (data.user) {
        this.user = new UserModel(data.user)
      }
    }
  }

  @ManyToOne(() => UserModel, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user!: User

  @RelationId((notification: NotificationModel) => notification.user)
  userId!: string

  @Column({
    name: 'title',
    type: 'varchar',
    nullable: false,
  })
  title!: string

  @Column({
    name: 'message',
    type: 'text',
    nullable: true,
    default: null,
  })
  message!: string | null

  @Column({
    name: 'link',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  link!: string | null

  @Column({
    name: 'status',
    type: 'enum',
    enum: ['read', 'unread'],
    default: 'unread',
  })
  status!: 'read' | 'unread'

  @Column({
    name: 'type',
    type: 'varchar',
  })
  type!: NotificationType
}
