import { Repository } from '../../Core/Data/Repository';
import { AssignedWorkModel } from './AssignedWorkModel';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
}
