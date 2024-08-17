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
      await this.assignedWorkRepository.getNotCheckedNotTestWorks(
        student.id,
        subject.id,
        ['mentors']
      )

    // TODO: make it more efficient

    // get only first 50 works mutating the mentors array, TODO: change it to a better solution
    notStartedWorks.splice(0, 50)

    notStartedWorks.forEach((work) => {
      work.mentors = [newMentor]
    })

    for (const work of notStartedWorks) {
      await this.assignedWorkRepository.update(work)
    }
  }
}
