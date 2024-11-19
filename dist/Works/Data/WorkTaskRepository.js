import { Repository } from '../../Core/Data/Repository.js';
import { WorkTaskModel } from './Relations/WorkTaskModel.js';
export class WorkTaskRepository extends Repository {
    constructor() {
        super(WorkTaskModel);
    }
}
