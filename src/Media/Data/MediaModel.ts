import { Column, Entity, ManyToOne, OneToOne } from 'typeorm'
import { Model } from '@modules/Core/Data/Model'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { PollAnswerModel } from '@modules/Polls/Data/Relations/PollAnswerModel'
import { Media } from './Media'
import { BlogPost } from '@modules/Blog/Data/BlogPost'
import { PollAnswer } from '@modules/Polls/Data/Relations/PollAnswer'
import { BlogPostModel } from '@modules/Blog/Data/BlogPostModel'
import { UserAvatarModel } from '@modules/Users/Data/Relations/UserAvatarModel'

@Entity('media')
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
  })
  src!: string

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
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
  courseMaterial!: CourseMaterialModel

  @ManyToOne(() => CourseModel, (course) => course.images, {
    onDelete: 'CASCADE',
  })
  course?: CourseModel

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
  avatar?: UserAvatarModel
}
