import { Repository } from '../../core/index';
import { WorkModel } from './WorkModel';
export class WorkRepository extends Repository {
    constructor() {
        super(WorkModel);
    }
}
