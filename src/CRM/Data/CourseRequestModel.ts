import { Model } from '@modules/Core/Data/Model'
import { Column, Entity } from 'typeorm'
import { CourseRequest } from './CourseRequest'
import { config } from '@modules/config'

@Entity('course_request')
export class CourseRequestModel extends Model implements CourseRequest {
  public constructor(data?: Partial<CourseRequest>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'course_id',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  courseId!: string

  @Column({
    name: 'email',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  email!: string
}
