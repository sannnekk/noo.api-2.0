import { Repository } from '../../core/index.js';
import { WorkModel } from './WorkModel.js';
export class WorkRepository extends Repository {
    constructor() {
        super(WorkModel);
    }
}
