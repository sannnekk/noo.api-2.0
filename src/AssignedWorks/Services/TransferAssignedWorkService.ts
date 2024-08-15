import { User } from '@modules/Users/Data/User'
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository'

export class TransferAssignedWorkService {
  private readonly assignedWorkRepository: AssignedWorkRepository

  constructor() {
    this.assignedWorkRepository = new AssignedWorkRepository()
  }

  public async transferNotFinishedWorks(
    student: User,
    newMentor: User
  ): Promise<void> {
    const notStartedWorks =
      await this.assignedWorkRepository.getNotFinishedWorks(student.id, [
        'mentors',
      ])

    notStartedWorks.forEach((work) => {
      work.mentors = [newMentor]
    })

    await Promise.all(notStartedWorks.map(this.assignedWorkRepository.update))
  }
}
