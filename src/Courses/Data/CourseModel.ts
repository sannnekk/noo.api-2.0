import { Model, Transliteration, ULID } from '@core'
import { Course } from './Course'
import { UserModel } from '@modules/Users/Data/UserModel'
import { User } from '@modules/Users/Data/User'
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	RelationId,
} from 'typeorm'
import { CourseChapterModel } from './Relations/CourseChapterModel'
import { CourseChapter } from './Relations/CourseChapter'
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { Media } from '@modules/Media/Data/Media'

@Entity('course')
export class CourseModel extends Model implements Course {
	constructor(data?: Partial<Course>) {
		super()

		if (data) {
			this.set(data)

			this.chapters = (data.chapters || []).map(
				(chapter) => new CourseChapterModel(chapter)
			)

			this.images = (data.images || []).map(
				(image) => new MediaModel(image)
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

	@ManyToMany(() => UserModel, (user) => user.coursesAsStudent, {
		cascade: true,
	})
	students?: User[]

	get studentIds(): User['id'][] {
		return this.students?.map((student) => student.id) || []
	}

	set studentIds(ids: User['id'][]) {}

	@Column({
		name: 'description',
		type: 'text',
	})
	description!: string

	@OneToMany(() => CourseChapterModel, (chapter) => chapter.course, {
		eager: true,
		cascade: true,
	})
	chapters!: CourseChapter[]

	@OneToMany(() => MediaModel, (media) => media.course, {
		eager: true,
		cascade: true,
	})
	images!: Media[]

	private sluggify(text: string): string {
		return ULID.generate() + '-' + Transliteration.sluggify(text)
	}
}
