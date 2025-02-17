import * as ULID from '@modules/Core/Data/Ulid'
import * as Transliteration from '@modules/Core/Utils/transliteration'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import {
  Brackets,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId,
  SelectQueryBuilder,
} from 'typeorm'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { WorkTaskModel } from './Relations/WorkTaskModel'
import { WorkTask } from './Relations/WorkTask'
import { Work } from './Work'
import { SearchableModel } from '@modules/Core/Data/SearchableModel'
import { BaseModel } from '@modules/Core/Data/Model'
import { SubjectModel } from '@modules/Subjects/Data/SubjectModel'
import { config } from '@modules/config'

type PartialWork = Omit<Partial<Work>, 'tasks'> & {
  tasks?: Partial<WorkTask>[]
}

@Entity('work')
export class WorkModel extends SearchableModel implements Work {
  constructor(data?: PartialWork) {
    super()

    if (data) {
      this.set(data)

      if (data.tasks) {
        this.tasks = data.tasks.map((task) => new WorkTaskModel(task))
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

  @Column({
    name: 'type',
    type: 'enum',
    enum: ['trial-work', 'phrase', 'mini-test', 'test', 'second-part'],
    default: 'test',
  })
  type!: 'trial-work' | 'phrase' | 'mini-test' | 'test' | 'second-part'

  @Column({
    name: 'description',
    type: 'text',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  description!: string

  @OneToMany(() => CourseMaterialModel, (material) => material.work)
  materials?: CourseMaterial[] | undefined

  @OneToMany(() => WorkTaskModel, (task) => task.work, {
    cascade: true,
  })
  tasks!: WorkTask[]

  @OneToMany(() => AssignedWorkModel, (assignedWork) => assignedWork.work)
  assignedWorks!: AssignedWork[]

  @ManyToOne(() => SubjectModel, (subject) => subject.works, {
    eager: true,
  })
  subject!: SubjectModel

  @RelationId((work: WorkModel) => work.subject)
  subjectId!: string

  public addSearchToQuery(
    query: SelectQueryBuilder<BaseModel>,
    needle: string
  ): string[] {
    query.andWhere(
      new Brackets((qb) => {
        qb.where('LOWER(work.name) LIKE LOWER(:needle)', {
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
