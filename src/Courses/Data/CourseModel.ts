import * as Transliteration from '@modules/Core/Utils/transliteration'
import * as ULID from '@modules/Core/Data/Ulid'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import {
  Brackets,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { Media } from '@modules/Media/Data/Media'
import { CourseChapterModel } from './Relations/CourseChapterModel'
import { CourseChapter } from './Relations/CourseChapter'
import { Course } from './Course'
import { CourseMaterial } from './Relations/CourseMaterial'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { SubjectModel } from '@modules/Subjects/Data/SubjectModel'
import { config } from '@modules/config'
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel'
import { CourseAssignment } from './Relations/CourseAssignment'

type PartialCourse = Partial<Omit<Course, 'chapters'>> & {
  chapters?: (Partial<Omit<CourseChapter, 'materials'>> & {
    materials?: Partial<CourseMaterial>[]
  })[]
}

@Entity('course')
export class CourseModel extends SearchableModel implements Course {
  constructor(data?: PartialCourse) {
    super()

    if (data) {
      this.set(data)

      if (data.chapters) {
        this.chapters = data.chapters.map(
          (chapter) => new CourseChapterModel(chapter)
        )
      }

      if (data.images) {
        this.images = data.images.map((image) => new MediaModel(image))
      }

      if (data.subject) {
        this.subject = new SubjectModel(data.subject)
      }

      if (!data.slug) {
        this.slug = this.sluggify(this.name)
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

  @ManyToMany(() => UserModel, (user) => user.courses)
  @JoinTable()
  authors!: User[]

  @OneToMany(() => CourseAssignmentModel, (assignment) => assignment.course)
  studentAssignments?: CourseAssignment[]

  @Column({
    name: 'description',
    type: 'text',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  description!: string

  @OneToMany(() => CourseChapterModel, (chapter) => chapter.course, {
    cascade: true,
  })
  chapters!: CourseChapter[]

  @OneToMany(() => MediaModel, (media) => media.course, {
    eager: true,
    cascade: true,
  })
  images!: Media[]

  @ManyToOne(() => SubjectModel, (subject) => subject.courses, {
    eager: true,
  })
  subject!: SubjectModel

  @RelationId((course: CourseModel) => course.subject)
  subjectId!: string

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where(`LOWER(course.name) LIKE LOWER(:needle)`, {
          needle: `%${needle}%`,
        })
        qb.orWhere(`LOWER(course.description) LIKE LOWER(:needle)`, {
          needle: `%${needle}%`,
        })
      })
    )

    return []
  }

  private sluggify(text: string): string {
    return `${ULID.generate()}-${Transliteration.sluggify(text)}`
  }
}
