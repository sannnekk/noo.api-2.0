import { Repository } from '../../core/index.js';
import { AssignedWorkModel } from './AssignedWorkModel.js';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
}
