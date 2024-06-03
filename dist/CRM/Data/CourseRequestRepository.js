import { Repository } from '../../Core/Data/Repository';
import { CourseRequestModel } from './CourseRequestModel';
export class CourseRequestRepository extends Repository {
    constructor() {
        super(CourseRequestModel);
    }
}
