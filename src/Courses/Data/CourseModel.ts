import { Model, Transliteration, ULID } from '@core'
import { Course } from './Course'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { CourseChapterModel } from './Relations/CourseChapterModel'
import { CourseChapter } from './Relations/CourseChapter'

@Entity('course')
export class CourseModel extends Model implements Course {
	constructor(data?: Partial<Course>) {
		super()

		if (data) {
			this.set(data)

			this.chapters = (data.chapters || []).map(
				(chapter) => new CourseChapterModel(chapter)
			)

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

	@ManyToOne(() => UserModel, (user) => user.courses, { eager: true })
	author!: User

	@RelationId((course: CourseModel) => course.author)
	authorId!: User['id']

	@Column({
		name: 'description',
		type: 'text',
	})
	description!: string

	@OneToMany(() => CourseChapterModel, (chapter) => chapter.course, {
		eager: true,
		cascade: true,
		onDelete: 'CASCADE',
	})
	chapters!: CourseChapter[]

	private sluggify(text: string): string {
		return ULID.generate() + '-' + Transliteration.sluggify(text)
	}
}
