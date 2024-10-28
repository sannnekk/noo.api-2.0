import type { User } from '@modules/Users/Data/User'
import type { Media } from '@modules/Media/Data/Media'
import type { UserSettings } from './UserSettings'
import { Model } from '@modules/Core/Data/Model'
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { UserModel } from '@modules/Users/Data/UserModel'

@Entity('user_settings')
export class UserSettingsModel extends Model implements UserSettings {
  public constructor(data?: Partial<UserSettings>) {
    super()

    if (data) {
      this.set(data)

      if (data.backgroundImage) {
        this.backgroundImage = new MediaModel(data.backgroundImage)
      }
    }
  }

  @OneToOne(() => UserModel, (user) => user.settings)
  @JoinColumn()
  user!: User

  @OneToOne(() => MediaModel, (media) => media.userSettings, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  backgroundImage!: Media | null

  @Column({
    name: 'font_size',
    type: 'enum',
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  })
  fontSize!: UserSettings['fontSize']
}
