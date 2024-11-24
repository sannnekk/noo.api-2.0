import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'
import { Model } from '@modules/Core/Data/Model'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { PollAnswerModel } from '@modules/Polls/Data/Relations/PollAnswerModel'
import type { Media } from './Media'
import type { BlogPost } from '@modules/Blog/Data/BlogPost'
import type { PollAnswer } from '@modules/Polls/Data/Relations/PollAnswer'
import { BlogPostModel } from '@modules/Blog/Data/BlogPostModel'
import { UserAvatarModel } from '@modules/Users/Data/Relations/UserAvatarModel'
import { config } from '@modules/config'
import { UserSettingsModel } from '@modules/UserSettings/Data/UserSettingsModel'
import { VideoModel } from '@modules/Video/Data/VideoModel'
import type { Video } from '@modules/Video/Data/Video'
import type { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import type { Course } from '@modules/Courses/Data/Course'
import type { UserAvatar } from '@modules/Users/Data/Relations/UserAvatar'
import type { UserSettings } from '@modules/UserSettings/Data/UserSettings'

@Entity('media', {
  orderBy: {
    order: 'ASC',
  },
})
export class MediaModel extends Model implements Media {
  constructor(data?: Partial<Media>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'src',
    type: 'varchar',
    length: 1024,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  src!: string

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  name?: string

  @Column({
    name: 'mime_type',
    type: 'enum',
    enum: ['image/jpeg', 'image/png', 'application/pdf'],
  })
  mimeType!: 'image/jpeg' | 'image/png' | 'application/pdf'

  @Column({
    name: 'order',
    type: 'int',
    default: 0,
  })
  order!: number

  @ManyToOne(
    () => CourseMaterialModel,
    (courseMaterial) => courseMaterial.files,
    { onDelete: 'CASCADE' }
  )
  courseMaterial!: CourseMaterial

  @ManyToOne(() => CourseModel, (course) => course.images, {
    onDelete: 'CASCADE',
  })
  course?: Course

  @ManyToOne(() => PollAnswerModel, (answer) => answer.files, {
    onDelete: 'SET NULL',
  })
  pollAnswer?: PollAnswer

  @ManyToOne(() => BlogPostModel, (post) => post.files, {
    onDelete: 'SET NULL',
  })
  blogPost?: BlogPost

  @OneToOne(() => UserAvatarModel, (avatar) => avatar.media, {
    onDelete: 'SET NULL',
  })
  avatar?: UserAvatar

  @OneToOne(() => UserSettingsModel, (settings) => settings.backgroundImage)
  userSettings?: UserSettings

  @OneToOne(() => VideoModel, (video) => video.thumbnail)
  videoAsThumbnail?: Video
}
