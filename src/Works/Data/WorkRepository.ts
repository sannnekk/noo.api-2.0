import { Repository } from '@modules/Core/Data/Repository'
import { WorkModel } from './WorkModel'
import { Work } from './Work'

export class WorkRepository extends Repository<Work> {
  constructor() {
    super(WorkModel)
  }
}
