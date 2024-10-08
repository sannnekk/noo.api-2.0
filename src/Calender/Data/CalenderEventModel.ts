import { Model } from '@modules/Core/Data/Model'
import { Column, Entity, ManyToOne, RelationId } from 'typeorm'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { CalenderEvent } from './CalenderEvent'
import { config } from '@modules/config'

@Entity('calender_event')
export class CalenderEventModel extends Model implements CalenderEvent {
  constructor(data?: Partial<CalenderEvent>) {
    super()

    if (data) {
      this.set(data)
    }
  }

  @Column({
    name: 'title',
    type: 'varchar',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  title!: string

  @Column({
    name: 'description',
    type: 'text',
    charset: config.database.charsets.withEmoji,
    collation: config.database.collations.withEmoji,
  })
  description!: string

  @Column({
    name: 'date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date!: Date

  @Column({
    name: 'url',
    type: 'varchar',
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  url!: string

  @Column({
    name: 'visibility',
    type: 'enum',
    enum: ['all', 'own-students', 'all-mentors', 'own-mentor', 'private'],
    default: 'private',
  })
  visibility: CalenderEvent['visibility'] = 'private'

  @Column({
    name: 'type',
    type: 'enum',
    enum: [
      'student-deadline',
      'mentor-deadline',
      'work-checked',
      'work-made',
      'event',
    ],
    default: 'event',
    nullable: false,
  })
  type:
    | 'student-deadline'
    | 'mentor-deadline'
    | 'work-checked'
    | 'work-made'
    | 'event' = 'event'

  @Column({
    name: 'username',
    type: 'varchar',
    nullable: false,
    charset: config.database.charsets.default,
    collation: config.database.collations.default,
  })
  username!: string

  @ManyToOne(
    () => AssignedWorkModel,
    (assignedWork) => assignedWork.calenderEvents,
    {
      onDelete: 'CASCADE',
    }
  )
  assignedWork?: AssignedWork

  @RelationId((calenderEvent: CalenderEventModel) => calenderEvent.assignedWork)
  assignedWorkId?: AssignedWork['id']
}
