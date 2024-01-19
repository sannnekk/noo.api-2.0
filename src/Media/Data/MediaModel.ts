import { Course } from '@modules/Courses/Data/Course'
import { Column, Entity, ManyToOne } from 'typeorm'
import { Media } from './Media'
import { Model } from '@core'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'

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
		unique: true,
	})
	src!: string

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
}
