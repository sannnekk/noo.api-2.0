import { Model } from '@modules/Core/Data/Model'
import { CourseRequest } from './CourseRequest'
import { Column, Entity } from 'typeorm'

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
	})
	courseId!: string

	@Column({
		name: 'email',
		type: 'varchar',
	})
	email!: string
}
