import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	RelationId,
} from 'typeorm'
import { CourseChapter } from './CourseChapter'
import { CourseMaterial } from './CourseMaterial'
import { DeltaContentType, Model, Transliteration, ULID } from '@core'
import { CourseChapterModel } from './CourseChapterModel'
import { WorkModel } from '@modules/Works/Data/WorkModel'

@Entity('course_material')
export class CourseMaterialModel
	extends Model
	implements CourseMaterial
{
	constructor(data?: Partial<CourseMaterial>) {
		super()

		if (data) {
			this.set(data)

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

	@Column({
		name: 'description',
		type: 'text',
	})
	description!: string

	@Column({
		name: 'content',
		type: 'json',
	})
	content!: DeltaContentType

	@ManyToOne(
		() => CourseChapterModel,
		(chapter: CourseChapter) => chapter.materials,
		{
			onDelete: 'CASCADE',
		}
	)
	chapter!: CourseChapter

	@RelationId((material: CourseMaterialModel) => material.chapter)
	chapterId!: CourseChapter['id']

	@ManyToOne(() => WorkModel, (work) => work.materials)
	work?: WorkModel | undefined

	@RelationId((material: CourseMaterialModel) => material.work)
	workId?: string | undefined

	private sluggify(text: string): string {
		return ULID.generate() + '-' + Transliteration.sluggify(text)
	}
}
