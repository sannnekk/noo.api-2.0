import { Repository } from '../../Core/Data/Repository';
import { CalenderEventModel } from './CalenderEventModel';
export class CalenderEventRepository extends Repository {
    constructor() {
        super(CalenderEventModel);
    }
}
