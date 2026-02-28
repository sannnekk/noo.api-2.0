import { Model } from '@modules/Core/Data/Model'
import { VideoComment } from './VideoComment'
import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from '@modules/Users/Data/User'
import { Video } from '../Video'
import { config } from '@modules/config'
import { UserModel } from '@modules/Users/Data/UserModel'
import { VideoModel } from '../VideoModel'

@Entity('video_comment')
export class VideoCommentModel extends Model implements VideoComment {
  public constructor(data?: Partial<VideoComment>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'text',
    type: 'text',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  text!: string

  @ManyToOne(() => UserModel, (user) => user.videoComments)
  user?: User

  @ManyToOne(() => VideoModel, (video) => video.comments)
  video?: Video
}
