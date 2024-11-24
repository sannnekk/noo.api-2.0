import { Model } from '@modules/Core/Data/Model'
import { Video } from './Video'
import { VideoChapterModel } from './Relations/VideoChapterModel'
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { User } from '@modules/Users/Data/User'
import { VideoChapter } from './Relations/VideoChapter'
import { Media } from '@modules/Media/Data/Media'
import { UserModel } from '@modules/Users/Data/UserModel'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'

@Entity('video')
export class VideoModel extends Model implements Video {
  public constructor(data?: Partial<Video>) {
    super()

    if (data) {
      this.set(data)

      if (data.chapters) {
        this.chapters = data.chapters.map(
          (chapter) => new VideoChapterModel(chapter)
        )
      }

      if (data.thumbnail) {
        this.thumbnail = new MediaModel(data.thumbnail)
      }
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
  description!: DeltaContentType

  @Column({
    name: 'url',
    type: 'varchar',
    length: 512,
    nullable: true,
    default: null,
  })
  url!: string | null

  @Column({
    name: 'service_type',
    type: 'varchar',
    length: 255,
  })
  serviceType!: Video['serviceType']

  @Column({
    name: 'unique_identifier',
    type: 'varchar',
    length: 255,
  })
  uniqueIdentifier!: string

  @Column({
    name: 'length',
    type: 'int',
  })
  length!: number

  @Column({
    name: 'state',
    type: 'varchar',
    length: 255,
  })
  state!: Video['state']

  @Column({
    name: 'published_at',
    type: 'timestamp',
  })
  publishedAt!: Date

  @Column({
    name: 'upload_url',
    type: 'varchar',
    length: 512,
    nullable: true,
    default: null,
  })
  uploadUrl!: string | null

  @Column({
    name: 'size_in_bytes',
    type: 'bigint',
  })
  sizeInBytes!: number

  @OneToMany(() => VideoChapterModel, (chapter) => chapter.video)
  chapters!: VideoChapter[]

  @ManyToOne(() => UserModel, (user) => user.uploadedVideos)
  uploadedBy!: User

  @OneToOne(() => MediaModel, (media) => media.videoAsThumbnail)
  @JoinColumn()
  thumbnail!: Media

  @ManyToOne(
    () => CourseMaterialModel,
    (courseMaterial) => courseMaterial.videos
  )
  courseMaterial!: CourseMaterialModel
}
