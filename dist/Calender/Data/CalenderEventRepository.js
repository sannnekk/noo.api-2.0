import { Repository } from '../../core/index.js';
import { CalenderEventModel } from './CalenderEventModel.js';
export class CalenderEventRepository extends Repository {
    constructor() {
        super(CalenderEventModel);
    }
}
