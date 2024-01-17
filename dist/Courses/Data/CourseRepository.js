import { Repository } from '@core';
import { CourseModel } from './CourseModel';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
}
