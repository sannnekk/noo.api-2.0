import { Repository } from '../../Core/Data/Repository.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
}
