import { Repository } from '../../Core/Data/Repository.js';
import { CalenderEventModel } from './CalenderEventModel.js';
export class CalenderEventRepository extends Repository {
    constructor() {
        super(CalenderEventModel);
    }
}
