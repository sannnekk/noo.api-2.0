import { Model } from '@modules/Core/Data/Model'
import * as Transliteration from '@modules/Core/Utils/transliteration'
import * as ULID from '@modules/Core/Data/Ulid'
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm'
import { CourseChapter } from './CourseChapter'
import { Course } from '../Course'
import { CourseMaterial } from './CourseMaterial'
import { CourseModel } from '../CourseModel'
import { CourseMaterialModel } from './CourseMaterialModel'
import { config } from '@modules/config'

type PartialCourseChapter = Partial<Omit<CourseChapter, 'materials'>> & {
  materials?: Partial<CourseMaterial>[]
}

@Entity('course_chapter', {
  orderBy: {
    order: 'ASC',
  },
})
export class CourseChapterModel extends Model implements CourseChapter {
  constructor(data?: PartialCourseChapter) {
    super()

    if (data) {
      this.set(data)

      if (data.chapters) {
        this.chapters = data.chapters.map(
          (chapter) => new CourseChapterModel(chapter)
        )
      }

      if (data.materials) {
        this.materials = data.materials.map(
          (material) => new CourseMaterialModel(material)
        )
      }

      if (!data.slug) {
        this.slug = this.sluggify(this.name)
      }
    }
  }

  @Column({
    name: 'name',
    type: 'varchar',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  name!: string

  @Column({
    name: 'slug',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  slug!: string

  @Column({
    name: 'order',
    type: 'int',
  })
  order!: number

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: false,
  })
  isActive!: boolean

  @ManyToOne(() => CourseModel, (course: Course) => course.chapters, {
    onDelete: 'CASCADE',
  })
  course?: Course

  @ManyToOne(
    () => CourseChapterModel,
    (chapter: CourseChapter) => chapter.chapters,
    {
      onDelete: 'CASCADE',
    }
  )
  parentChapter?: CourseChapter

  @OneToMany(() => CourseChapterModel, (chapter) => chapter.parentChapter, {
    cascade: ['insert'],
  })
  chapters?: CourseChapter[]

  @OneToMany(
    () => CourseMaterialModel,
    (material: CourseMaterial) => material.chapter,
    {
      cascade: ['insert'],
    }
  )
  materials?: CourseMaterial[]

  private sluggify(text: string): string {
    return `${ULID.generate()}-${Transliteration.sluggify(text)}`
  }
}
