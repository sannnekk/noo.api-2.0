import { Repository } from '../../Core/Data/Repository';
import { AssignedWorkCommentModel } from './Relations/AssignedWorkCommentModel';
export class AssignedWorkCommentRepository extends Repository {
    constructor() {
        super(AssignedWorkCommentModel);
    }
}
