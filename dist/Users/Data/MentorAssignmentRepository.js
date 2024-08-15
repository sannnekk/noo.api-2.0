import { Repository } from '../../Core/Data/Repository.js';
import { MentorAssignmentModel } from './Relations/MentorAssignmentModel.js';
export class MentorAssignmentRepository extends Repository {
    constructor() {
        super(MentorAssignmentModel);
    }
}
