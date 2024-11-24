import { Model } from '@modules/Core/Data/Model'
import { VideoChapter } from './VideoChapter'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Video } from '../Video'
import { VideoModel } from '../VideoModel'

@Entity('video_chapter')
export class VideoChapterModel extends Model implements VideoChapter {
  public constructor(data?: Partial<VideoChapter>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'title',
    type: 'varchar',
    length: 255,
  })
  title!: string

  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
    default: null,
  })
  description!: string | null

  @Column({
    name: 'timestamp',
    type: 'int',
  })
  timestamp!: number

  @ManyToOne(() => VideoModel, (video) => video.chapters)
  video?: Video
}
