import { Repository } from '../../Core/Data/Repository';
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel';
export class AssignedWorkAnswerRepository extends Repository {
    constructor() {
        super(AssignedWorkAnswerModel);
    }
}
