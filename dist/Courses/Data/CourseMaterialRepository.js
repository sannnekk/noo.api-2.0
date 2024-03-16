import { Repository } from '../../core/index.js';
import { CourseMaterialModel } from './Relations/CourseMaterialModel.js';
export class CourseMaterialRepository extends Repository {
    constructor() {
        super(CourseMaterialModel);
    }
}
