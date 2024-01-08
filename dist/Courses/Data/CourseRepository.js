import { Repository } from '../../core/index';
import { CourseModel } from './CourseModel';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
}
