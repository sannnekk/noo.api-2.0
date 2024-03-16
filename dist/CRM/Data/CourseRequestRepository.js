import { Repository } from '../../core/index.js';
import { CourseRequestModel } from './CourseRequestModel.js';
export class CourseRequestRepository extends Repository {
    constructor() {
        super(CourseRequestModel);
    }
}
