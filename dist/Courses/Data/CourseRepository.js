import { Repository } from '../../Core/Data/Repository';
import { CourseModel } from './CourseModel';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
}
