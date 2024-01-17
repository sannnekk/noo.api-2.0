import { Repository } from '@core';
import { WorkModel } from './WorkModel';
export class WorkRepository extends Repository {
    constructor() {
        super(WorkModel);
    }
}
