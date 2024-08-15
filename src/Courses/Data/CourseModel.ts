import * as Transliteration from '@modules/Core/Utils/transliteration'
import * as ULID from '@modules/Core/Data/Ulid'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import {
  Brackets,
  Column,
  Entity,
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
  })
  slug!: string

  @Column({
    name: 'name',
    type: 'varchar',
  })
  name!: string

  @ManyToOne(() => UserModel, (user) => user.courses)
  author!: User

  @RelationId((course: CourseModel) => course.author)
  authorId!: User['id']

  @ManyToMany(() => UserModel, (user) => user.coursesAsStudent, {
    cascade: true,
  })
  students?: User[]

  @RelationId((course: CourseModel) => course.students)
  studentIds!: string[]

  @Column({
    name: 'description',
    type: 'text',
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
        qb.where(`course.name LIKE :needle`, { needle: `%${needle}%` })
        qb.orWhere(`course.description LIKE :needle`, { needle: `%${needle}%` })
      })
    )

    return []
  }

  private sluggify(text: string): string {
    return `${ULID.generate()}-${Transliteration.sluggify(text)}`
  }
}
