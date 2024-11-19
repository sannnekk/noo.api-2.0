import { Repository } from '@modules/Core/Data/Repository'
import { WorkTaskModel } from './Relations/WorkTaskModel'
import { WorkTask } from './Relations/WorkTask'

export class WorkTaskRepository extends Repository<WorkTask> {
  constructor() {
    super(WorkTaskModel)
  }
}
