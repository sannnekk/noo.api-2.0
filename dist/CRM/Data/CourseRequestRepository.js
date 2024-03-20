import { Repository } from '../../Core/Data/Repository.js';
import { CourseRequestModel } from './CourseRequestModel.js';
export class CourseRequestRepository extends Repository {
    constructor() {
        super(CourseRequestModel);
    }
}
