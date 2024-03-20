import { Repository } from '../../Core/Data/Repository.js';
import { CourseMaterialModel } from './Relations/CourseMaterialModel.js';
export class CourseMaterialRepository extends Repository {
    constructor() {
        super(CourseMaterialModel);
    }
}
