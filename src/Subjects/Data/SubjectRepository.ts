import { Repository } from '@modules/Core/Data/Repository'
import { Subject } from './Subject'
import { SubjectModel } from './SubjectModel'

export class SubjectRepository extends Repository<Subject> {
  public constructor() {
    super(SubjectModel)
  }
}
