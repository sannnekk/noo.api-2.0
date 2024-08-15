import { Repository } from '@modules/Core/Data/Repository'
import { AssignedWork } from './AssignedWork'
import { AssignedWorkModel } from './AssignedWorkModel'

export class AssignedWorkRepository extends Repository<AssignedWork> {
  constructor() {
    super(AssignedWorkModel)
  }

  public async getNotFinishedWorks(
    studentId: string,
    relations: (keyof AssignedWork)[]
  ): Promise<AssignedWork[]> {
    const { entities: notStartedWorks } = await this.search(
      {
        studentId,
        solveStatus: 'not-started',
      },
      undefined,
      relations
    )

    const { entities: inProgressWorks } = await this.search(
      {
        studentId,
        solveStatus: 'in-progress',
      },
      undefined,
      relations
    )

    return [...notStartedWorks, ...inProgressWorks]
  }
}
