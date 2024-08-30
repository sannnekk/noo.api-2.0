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
    const assignedWorkIds =
      await this.assignedWorkRepository.findWorkIdsByStudentAndSubject(
        student.id,
        subject.id
      )

    if (assignedWorkIds.length === 0) {
      return
    }

    // remove all mentors from assigned works
    await this.assignedWorkRepository.removeMentorsFromAssignedWorks(
      assignedWorkIds
    )

    // assign new mentor to assigned works
    await this.assignedWorkRepository.assignMentorToAssignedWorks(
      assignedWorkIds,
      newMentor.id
    )
  }
}
