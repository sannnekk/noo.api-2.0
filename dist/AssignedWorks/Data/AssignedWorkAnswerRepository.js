import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkAnswerModel } from './Relations/AssignedWorkAnswerModel.js';
export class AssignedWorkAnswerRepository extends Repository {
    constructor() {
        super(AssignedWorkAnswerModel);
    }
}
