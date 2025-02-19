import { BaseModel } from '@modules/Core/Data/Model'
import { Video } from './Video'
import { VideoChapterModel } from './Relations/VideoChapterModel'
import {
  Brackets,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  SelectQueryBuilder,
} from 'typeorm'
import type { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import type { User } from '@modules/Users/Data/User'
import type { VideoChapter } from './Relations/VideoChapter'
import type { Media } from '@modules/Media/Data/Media'
import type { VideoComment } from './Relations/VideoComment'
import { UserModel } from '@modules/Users/Data/UserModel'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { VideoCommentModel } from './Relations/VideoCommentModel'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'

@Entity('video')
export class VideoModel extends SearchableModel implements Video {
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
    type: 'json',
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
    name: 'duration',
    type: 'int',
  })
  duration!: number

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

  @Column({
    name: 'access_type',
    type: 'varchar',
    length: 255,
  })
  accessType!: Video['accessType']

  @Column({
    name: 'access_value',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: null,
  })
  accessValue!: string | null

  @OneToMany(() => VideoChapterModel, (chapter) => chapter.video)
  chapters!: VideoChapter[]

  @OneToMany(() => VideoCommentModel, (comment) => comment.video)
  comments!: VideoComment[]

  @ManyToOne(() => UserModel, (user) => user.uploadedVideos)
  uploadedBy!: User

  @OneToOne(() => MediaModel, (media) => media.videoAsThumbnail, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  thumbnail!: Media

  @ManyToOne(
    () => CourseMaterialModel,
    (courseMaterial) => courseMaterial.videos
  )
  courseMaterial!: CourseMaterial

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(video__uploadedBy.name) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
        qb.orWhere('LOWER(video.title) LIKE LOWER(:needle)', {
          needle: `%${needle}%`,
        })
      })
    )

    return ['uploadedBy']
  }
}
