import { Model } from '@modules/Core/Data/Model'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { PushSubscription } from './PushSubscription'

@Entity('push_subscription')
export class PushSubscriptionModel extends Model implements PushSubscription {
  public constructor(data?: Partial<PushSubscription>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @ManyToOne(() => UserModel, {
    onDelete: 'CASCADE',
  })
  user!: User

  @RelationId((subscription: PushSubscriptionModel) => subscription.user)
  userId!: string

  @Column({
    name: 'endpoint',
    type: 'varchar',
    length: 512,
    unique: true,
  })
  endpoint!: string

  @Column({
    name: 'p256dh',
    type: 'varchar',
  })
  p256dh!: string

  @Column({
    name: 'auth',
    type: 'varchar',
  })
  auth!: string

  @Column({
    name: 'user_agent',
    type: 'varchar',
    nullable: true,
    default: null,
  })
  userAgent!: string | null
}
