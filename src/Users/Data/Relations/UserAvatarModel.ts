import { Model } from '@modules/Core/Data/Model'
import { Media } from '@modules/Media/Data/Media'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { UserAvatar } from './UserAvatar'
import { UserModel } from '../UserModel'
import { User } from '../User'

@Entity('user_avatar')
export class UserAvatarModel extends Model implements UserAvatar {
  public constructor(data?: Partial<UserAvatar>) {
    super()

    if (data) {
      this.set(data)

      if (data.media) {
        this.media = new MediaModel(data.media)
      }
    }
  }

  @OneToOne(() => MediaModel, (media) => media.avatar, {
    eager: true,
    onDelete: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  media?: Media

  @OneToOne(() => UserModel, (user) => user.avatar)
  user!: User

  @Column({
    name: 'avatar_type',
    type: 'enum',
    enum: ['telegram', 'custom'],
    default: 'custom',
  })
  avatarType!: UserAvatar['avatarType']

  @Column({
    name: 'telegram_avatar_url',
    type: 'varchar',
    nullable: true,
  })
  telegramAvatarUrl?: string
}
