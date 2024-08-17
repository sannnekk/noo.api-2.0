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
    const checkStatusToTransfer: AssignedWork['checkStatus'][] = [
      'not-checked',
      'checked-automatically',
    ]

    return this.findAll(
      {
        student: {
          id: studentId,
        },
        checkStatus: TypeORM.In(checkStatusToTransfer),
        work: { subject: { id: subjectId } },
      },
      relations,
      {
        id: 'DESC',
      }
    )
  }
}
