import { Repository } from '../../core/index.js';
import { CourseModel } from './CourseModel.js';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
}
