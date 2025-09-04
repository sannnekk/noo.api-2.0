import { Model } from '@modules/Core/Data/Model'
import { Course } from '../Course'
import { User } from '@modules/Users/Data/User'
import { CourseAssignment } from './CourseAssignment'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { CourseModel } from '../CourseModel'
import { UserModel } from '@modules/Users/Data/UserModel'

@Entity('course_assignment')
export class CourseAssignmentModel extends Model implements CourseAssignment {
  public constructor(data?: Partial<CourseAssignment>) {
    super()

    if (data) {
      this.set(data)

      if (data.course) {
        this.course = new CourseModel(data.course)
      }

      if (data.student) {
        this.student = new UserModel(data.student)
      }

      if (data.assigner) {
        this.assigner = new UserModel(data.assigner)
      }
    }
  }

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived!: boolean

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned!: boolean

  @ManyToOne(() => CourseModel, (course) => course.studentAssignments, {
    onDelete: 'CASCADE',
  })
  course?: Course

  @RelationId((assignment: CourseAssignmentModel) => assignment.course)
  courseId!: Course['id']

  @ManyToOne(() => UserModel, (user) => user.courseAssignments, {
    onDelete: 'CASCADE',
  })
  student?: User

  @RelationId((assignment: CourseAssignmentModel) => assignment.student)
  studentId!: User['id']

  @ManyToOne(() => UserModel, (user) => user.courseAssignmentsAsAssigner, {
    onDelete: 'SET NULL',
  })
  assigner?: User

  @RelationId((assignment: CourseAssignmentModel) => assignment.assigner)
  assignerId!: User['id']
}
