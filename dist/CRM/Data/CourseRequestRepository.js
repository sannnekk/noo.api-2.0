import { Repository } from '@core';
import { CourseRequestModel } from './CourseRequestModel';
export class CourseRequestRepository extends Repository {
    constructor() {
        super(CourseRequestModel);
    }
}
