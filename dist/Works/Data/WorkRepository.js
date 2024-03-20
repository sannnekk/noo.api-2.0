import { Repository } from '../../Core/Data/Repository.js';
import { WorkModel } from './WorkModel.js';
export class WorkRepository extends Repository {
    constructor() {
        super(WorkModel);
    }
}
