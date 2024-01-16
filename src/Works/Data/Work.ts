import { BaseModel } from '@core'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { WorkTask } from './Relations/WorkTask'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'

export interface Work extends BaseModel {
	id: string
	slug: string
	name: string
	description: string
	materialId?: string
	materials?: CourseMaterial[]
	tasks: WorkTask[]
	taskIds: string[]
	assignedWorks: AssignedWork[]
	assignedWorkIds: AssignedWork['id'][]
}
