import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { DeltaContentType } from '@modules/Core/Data/DeltaContentType'
import { Model } from '@modules/Core/Data/Model'
import * as ULID from '@modules/Core/Data/Ulid'
import * as Transliteration from '@modules/Core/Utils/transliteration'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { CourseChapterModel } from './CourseChapterModel'
import { CourseMaterial } from './CourseMaterial'
import { CourseChapter } from './CourseChapter'
import { config } from '@modules/config'

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
  workSolveDeadline?: Date

  @Column({
    name: 'work_check_deadline',
    type: 'timestamp',
    nullable: true,
  })
  workCheckDeadline?: Date

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

  @ManyToOne(
    () => CourseChapterModel,
    (chapter: CourseChapter) => chapter.materials,
    {
      onDelete: 'CASCADE',
    }
  )
  chapter!: CourseChapter

  @RelationId((material: CourseMaterialModel) => material.chapter)
  chapterId!: CourseChapter['id']

  @ManyToOne(() => WorkModel, (work) => work.materials)
  work?: WorkModel | undefined

  @RelationId((material: CourseMaterialModel) => material.work)
  workId?: string | undefined

  @OneToMany(() => MediaModel, (media) => media.courseMaterial, {
    eager: true,
    cascade: true,
  })
  files!: MediaModel[]

  private sluggify(text: string): string {
    return `${ULID.generate()}-${Transliteration.sluggify(text)}`
  }
}
