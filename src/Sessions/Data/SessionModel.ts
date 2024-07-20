import { Model } from '@modules/Core/Data/Model'
import { type Session } from './Session'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { User } from '@modules/Users/Data/User'
import { UserModel } from '@modules/Users/Data/UserModel'

@Entity('session')
export class SessionModel extends Model implements Session {
  public constructor(data?: Partial<Session>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'user_agent',
    type: 'varchar',
  })
  userAgent!: string

  @Column({
    name: 'is_mobile',
    type: 'boolean',
  })
  isMobile!: boolean

  @Column({
    name: 'browser',
    type: 'varchar',
    nullable: true,
  })
  browser?: string | null | undefined

  @Column({
    name: 'os',
    type: 'varchar',
    nullable: true,
  })
  os?: string | null | undefined

  @Column({
    name: 'device',
    type: 'varchar',
    nullable: true,
  })
  device?: string | null | undefined

  @Column({
    name: 'ip_address',
    type: 'varchar',
  })
  ipAddress!: string

  @Column({
    name: 'last_request_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastRequestAt!: Date

  @ManyToOne(() => UserModel, (user) => user.sessions)
  user!: User

  @RelationId((session: SessionModel) => session.user)
  userId!: string
}
