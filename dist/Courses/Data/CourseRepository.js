import { Repository } from '../../Core/Data/Repository.js';
import { CourseModel } from './CourseModel.js';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
}
