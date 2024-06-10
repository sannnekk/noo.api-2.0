import { BaseModel } from '@modules/Core/Data/Model'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { WorkTask } from './Relations/WorkTask'

export interface Work extends BaseModel {
  id: string
  slug: string
  name: string
  type: 'trial-work' | 'phrase' | 'mini-test' | 'test' | 'second-part'
  description: string
  materialId?: string
  materials?: CourseMaterial[]
  tasks: WorkTask[]
  taskIds: string[]
  assignedWorks: AssignedWork[]
}
