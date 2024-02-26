import { Repository } from '@core';
import { CourseMaterialModel } from './Relations/CourseMaterialModel';
export class CourseMaterialRepository extends Repository {
    constructor() {
        super(CourseMaterialModel);
    }
}
