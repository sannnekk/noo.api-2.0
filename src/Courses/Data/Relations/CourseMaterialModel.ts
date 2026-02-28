import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import * as Transliteration from '@modules/Core/Utils/transliteration'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { CourseChapterModel } from './CourseChapterModel'
import type { CourseMaterial } from './CourseMaterial'
import type { CourseChapter } from './CourseChapter'
import { config } from '@modules/config'
import { PollModel } from '@modules/Polls/Data/PollModel'
import type { Poll } from '@modules/Polls/Data/Poll'
import { CourseMaterialReactionModel } from './CourseMaterialReactionModel'
import type { CourseMaterialReaction } from './CourseMaterialReaction'
import { VideoModel } from '@modules/Video/Data/VideoModel'
import type { Video } from '@modules/Video/Data/Video'

@Entity('course_material', {
  orderBy: {
    order: 'ASC',
  },
})
export class CourseMaterialModel extends Model implements CourseMaterial {
  constructor(data?: Partial<CourseMaterial>) {
    super()

    if (data) {
      this.set(data)

      if (!data.slug) {
        this.slug = this.sluggify(this.name)
      }

      if (data.files) {
        this.files = data.files.map((file) => new MediaModel(file))
      }
    }
  }

  @Column({
    name: 'slug',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  slug!: string

  @Column({
    name: 'name',
    type: 'varchar',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  name!: string

  @Column({
    name: 'description',
    type: 'text',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  description!: string

  @Column({
    name: 'content',
    type: 'json',
  })
  content!: DeltaContentType

  @Column({
    name: 'work_solve_deadline',
    type: 'timestamp',
    nullable: true,
  })
  workSolveDeadline!: Date | null

  @Column({
    name: 'work_check_deadline',
    type: 'timestamp',
    nullable: true,
  })
  workCheckDeadline!: Date | null

  @Column({
    name: 'is_work_available',
    type: 'boolean',
    default: true,
  })
  isWorkAvailable!: boolean

  @Column({
    name: 'is_pinned',
    type: 'boolean',
    default: false,
  })
  isPinned!: boolean

  @Column({
    name: 'title_color',
    type: 'varchar',
    nullable: true,
  })
  titleColor!: string

  @Column({
    name: 'order',
    type: 'int',
    default: 0,
  })
  order!: number

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive!: boolean

  @Column({
    name: 'activate_at',
    type: 'timestamp',
    nullable: true,
  })
  activateAt!: Date | null

  @ManyToOne(
    () => CourseChapterModel,
    (chapter: CourseChapter) => chapter.materials,
    {
      onDelete: 'CASCADE',
    }
  )
  chapter!: CourseChapter

  @ManyToOne(() => WorkModel, (work) => work.materials)
  work!: WorkModel | null

  @RelationId((material: CourseMaterialModel) => material.work)
  workId?: string

  @ManyToOne(() => PollModel, (poll) => poll.materials)
  poll?: Poll

  @RelationId((material: CourseMaterialModel) => material.poll)
  pollId?: Poll['id']

  @OneToMany(() => MediaModel, (media) => media.courseMaterial, {
    eager: true,
    cascade: true,
  })
  files!: MediaModel[]

  @ManyToMany(() => VideoModel, (video) => video.courseMaterial)
  @JoinTable()
  videos!: Video[]

  @OneToMany(() => CourseMaterialReactionModel, (reaction) => reaction.material)
  reactions!: CourseMaterialReaction[]

  private sluggify(text: string): string {
    return `${ULID.generate()}-${Transliteration.sluggify(text)}`
  }
}
