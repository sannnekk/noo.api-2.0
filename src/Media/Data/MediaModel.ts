import { Column, Entity, ManyToOne } from 'typeorm'
import { Media } from './Media'
import { Model } from '@modules/Core/Data/Model'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { PollAnswerModel } from '@modules/Polls/Data/Relations/PollAnswerModel'

@Entity('media')
export class MediaModel extends Model implements Media {
	constructor(data?: Partial<Media>) {
		super()

		if (data) {
			this.set(data)
		}
	}

	@Column({
		name: 'src',
		type: 'varchar',
		length: 1024,
	})
	src!: string

	@Column({
		name: 'name',
		type: 'varchar',
		length: 255,
	})
	name?: string

	@Column({
		name: 'mime_type',
		type: 'enum',
		enum: ['image/jpeg', 'image/png', 'application/pdf'],
	})
	mimeType!: 'image/jpeg' | 'image/png' | 'application/pdf'

	@ManyToOne(
		() => CourseMaterialModel,
		(courseMaterial) => courseMaterial.files,
		{ onDelete: 'CASCADE' }
	)
	courseMaterial!: CourseMaterialModel

	@ManyToOne(() => CourseModel, (course) => course.images, {
		onDelete: 'CASCADE',
	})
	course?: CourseModel

	@ManyToOne(() => PollAnswerModel, (answer) => answer.files, {
		onDelete: 'SET NULL',
	})
	pollAnswer?: PollAnswerModel
}
