import { Model, Transliteration, ULID } from '@core'
import { Work } from './Work'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { WorkTask } from './Relations/WorkTask'
import { Column, Entity, OneToMany, OneToOne } from 'typeorm'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { WorkTaskModel } from './Relations/WorkTaskModel'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'

@Entity('work')
export class WorkModel extends Model implements Work {
	constructor(data?: Partial<Work>) {
		super()

		if (data) {
			this.set(data)

			this.tasks = (data.tasks || []).map(
				(chapter) => new WorkTaskModel(chapter)
			)

			this.assignedWorks = (data.assignedWorks || []).map(
				(assignedWork) => new AssignedWorkModel(assignedWork)
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

	@Column({
		name: 'type',
		type: 'enum',
		enum: ['trial-work', 'mini-test', 'test', 'second-part'],
		default: 'test',
	})
	type: 'trial-work' | 'mini-test' | 'test' | 'second-part' = 'test'

	@Column({
		name: 'description',
		type: 'text',
	})
	description!: string

	@OneToMany(() => CourseMaterialModel, (material) => material.work)
	materials?: CourseMaterial[] | undefined

	@OneToMany(() => WorkTaskModel, (task) => task.work, {
		eager: true,
		cascade: true,
	})
	tasks!: WorkTask[]

	get taskIds(): string[] {
		return (this.tasks || []).map((task) => task.id)
	}

	set taskIds(ids: string[]) {}

	@OneToMany(
		() => AssignedWorkModel,
		(assignedWork) => assignedWork.work,
		{ cascade: true }
	)
	assignedWorks!: AssignedWork[]

	get assignedWorkIds(): string[] {
		return (this.assignedWorks || []).map(
			(assignedWork) => assignedWork.id
		)
	}

	set assignedWorkIds(ids: string[]) {}

	static entriesToSearch() {
		return ['name', 'description']
	}

	private sluggify(text: string): string {
		return ULID.generate() + '-' + Transliteration.sluggify(text)
	}
}
