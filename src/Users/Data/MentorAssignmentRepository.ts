import { Repository } from '@modules/Core/Data/Repository'
import { MentorAssignment } from './Relations/MentorAssignment'
import { MentorAssignmentModel } from './Relations/MentorAssignmentModel'

export class MentorAssignmentRepository extends Repository<MentorAssignment> {
  constructor() {
    super(MentorAssignmentModel)
  }
}
