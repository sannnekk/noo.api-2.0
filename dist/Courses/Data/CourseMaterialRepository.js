import { Repository } from '../../Core/Data/Repository';
import { CourseMaterialModel } from './Relations/CourseMaterialModel';
export class CourseMaterialRepository extends Repository {
    constructor() {
        super(CourseMaterialModel);
    }
}
