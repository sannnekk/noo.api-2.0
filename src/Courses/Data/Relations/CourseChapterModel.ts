import { Model, Transliteration, ULID } from '@core'
import { CourseChapter } from './CourseChapter'
import { Course } from '../Course'
import { CourseMaterial } from './CourseMaterial'
import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { CourseModel } from '../CourseModel'
import { CourseMaterialModel } from './CourseMaterialModel'

@Entity('course_chapter')
export class CourseChapterModel extends Model implements CourseChapter {
	constructor(data?: Partial<CourseChapter>) {
		super()

		if (data) {
			this.set(data)

			this.materials = (data.materials || []).map(
				(chapter) => new CourseMaterialModel(chapter)
			)

			if (!data.slug) {
				this.slug = this.sluggify(this.name)
			}
		}
	}

	@Column({
		name: 'name',
		type: 'varchar',
	})
	name!: string

	@Column({
		name: 'slug',
		type: 'varchar',
	})
	slug!: string

	@Column({
		name: 'order',
		type: 'int',
	})
	order!: number

	@ManyToOne(() => CourseModel, (course: Course) => course.chapters, {
		onDelete: 'CASCADE',
	})
	course?: Course

	@RelationId((chapter: CourseChapterModel) => chapter.course)
	courseId?: Course['id']

	@OneToMany(
		() => CourseMaterialModel,
		(material: CourseMaterial) => material.chapter,
		{ cascade: true, eager: true }
	)
	materials?: CourseMaterial[] | undefined

	private sluggify(text: string): string {
		return ULID.generate() + '-' + Transliteration.sluggify(text)
	}
}
