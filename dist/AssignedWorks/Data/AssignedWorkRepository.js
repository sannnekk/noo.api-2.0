import { Repository } from '@core';
import { AssignedWorkModel } from './AssignedWorkModel';
export class AssignedWorkRepository extends Repository {
    constructor() {
        super(AssignedWorkModel);
    }
}
