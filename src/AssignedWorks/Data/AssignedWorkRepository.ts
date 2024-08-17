import { Repository } from '@modules/Core/Data/Repository'
import { AssignedWork } from './AssignedWork'
import { AssignedWorkModel } from './AssignedWorkModel'
import TypeORM from 'typeorm'

export class AssignedWorkRepository extends Repository<AssignedWork> {
  constructor() {
    super(AssignedWorkModel)
  }

  public async getNotCheckedWorks(
    studentId: string,
    subjectId: string,
    relations: (keyof AssignedWork)[]
  ): Promise<AssignedWork[]> {
    return this.findAll(
      {
        student: {
          id: studentId,
        },
        checkStatus: TypeORM.In([
          'not-checked',
          'checked-automatically',
        ] as AssignedWork['checkStatus'][]),
        work: { subject: { id: subjectId } },
      },
      relations,
      {
        id: 'DESC',
      }
    )
  }
}
