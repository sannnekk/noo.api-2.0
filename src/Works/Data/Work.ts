import { BaseModel } from '@modules/Core/Data/Model'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { WorkTask } from './Relations/WorkTask'
import { Subject } from '@modules/Subjects/Data/Subject'

export interface Work extends BaseModel {
  id: string
  slug: string
  name: string
  type: 'trial-work' | 'phrase' | 'mini-test' | 'test' | 'second-part'
  description: string
  subject?: Subject
  subjectId?: Subject['id']
  materialId?: CourseMaterial['id']
  materials?: CourseMaterial[]
  tasks: WorkTask[]
  taskIds: WorkTask['id'][]
  assignedWorks: AssignedWork[]
}
