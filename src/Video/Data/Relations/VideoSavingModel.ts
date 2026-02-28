import { Model } from '@modules/Core/Data/Model'
import { Video } from '../Video'
import { User } from '@modules/Users/Data/User'
import { VideoSaving } from './VideoSaving'
import { Entity, ManyToOne } from 'typeorm'
import { VideoModel } from '../VideoModel'
import { UserModel } from '@modules/Users/Data/UserModel'

@Entity('video_saving')
export class VideoSavingModel extends Model implements VideoSaving {
  public constructor(data?: Partial<VideoSaving>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @ManyToOne(() => VideoModel, (video) => video.savings, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  video!: Video

  @ManyToOne(() => UserModel, (user) => user.savedVideos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user!: User
}
