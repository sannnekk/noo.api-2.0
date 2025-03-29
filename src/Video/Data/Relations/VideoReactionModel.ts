import { Model } from '@modules/Core/Data/Model'
import { VideoReaction } from './VideoReaction'
import { Column, Entity, ManyToOne } from 'typeorm'
import { User } from '@modules/Users/Data/User'
import { UserModel } from '@modules/Users/Data/UserModel'
import { VideoModel } from '../VideoModel'
import { Video } from '../Video'

@Entity('video_reaction')
export class VideoReactionModel extends Model implements VideoReaction {
  public constructor(data?: Partial<VideoReaction>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'reaction',
    type: 'enum',
    enum: ['like', 'dislike', 'sad', 'happy', 'mindblowing'],
    nullable: false,
  })
  reaction!: VideoReaction['reaction']

  @ManyToOne(() => UserModel, (user) => user.videoReactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user?: User

  @ManyToOne(() => VideoModel, (video) => video.reactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  video?: Video
}
