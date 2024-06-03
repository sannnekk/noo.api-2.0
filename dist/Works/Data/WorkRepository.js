import { Repository } from '../../Core/Data/Repository';
import { WorkModel } from './WorkModel';
export class WorkRepository extends Repository {
    constructor() {
        super(WorkModel);
    }
}
