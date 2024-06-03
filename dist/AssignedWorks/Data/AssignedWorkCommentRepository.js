import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel.js';
export class AssignedWorkCommentRepository extends Repository {
    constructor() {
        super(AssignedWorkCommentModel);
    }
}
