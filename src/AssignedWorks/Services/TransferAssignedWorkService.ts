import { User } from '@modules/Users/Data/User'
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository'
import { Subject } from '@modules/Subjects/Data/Subject'

export class TransferAssignedWorkService {
  private readonly assignedWorkRepository: AssignedWorkRepository

  constructor() {
    this.assignedWorkRepository = new AssignedWorkRepository()
  }

  public async transferNotCheckedWorks(
    student: User,
    newMentor: User,
    subject: Subject
  ): Promise<void> {
    const notStartedWorks =
      await this.assignedWorkRepository.getNotCheckedWorks(
        student.id,
        subject.id,
        ['mentors']
      )

    for (const work of notStartedWorks) {
      work.mentors = [newMentor]
      await this.assignedWorkRepository.update(work)
    }
  }
}
