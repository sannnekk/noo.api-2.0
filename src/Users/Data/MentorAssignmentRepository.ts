import { Repository } from '@modules/Core/Data/Repository'
import { MentorAssignment } from './Relations/MentorAssignment'
import { MentorAssignmentModel } from './Relations/MentorAssignmentModel'

export class MentorAssignmentRepository extends Repository<MentorAssignment> {
  constructor() {
    super(MentorAssignmentModel)
  }

  public async deleteFromStudent(studentId: string): Promise<void> {
    await this.queryBuilder('mentor_assignment')
      .delete()
      .where('mentor_assignment.studentId = :id', { id: studentId })
      .execute()
  }
}
