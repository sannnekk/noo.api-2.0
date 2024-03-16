import { Repository } from '@core';
import { CalenderEventModel } from './CalenderEventModel';
export class CalenderEventRepository extends Repository {
    constructor() {
        super(CalenderEventModel);
    }
}
