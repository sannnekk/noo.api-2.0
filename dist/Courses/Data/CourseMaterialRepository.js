import { Repository } from '../../core/index';
import { CourseMaterialModel } from './Relations/CourseMaterialModel';
export class CourseMaterialRepository extends Repository {
    constructor() {
        super(CourseMaterialModel);
    }
}
