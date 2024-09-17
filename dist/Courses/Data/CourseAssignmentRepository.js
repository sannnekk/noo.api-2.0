import { Repository } from '../../Core/Data/Repository.js';
import { CourseAssignmentModel } from './Relations/CourseAssignmentModel.js';
export class CourseAssignmentRepository extends Repository {
    constructor() {
        super(CourseAssignmentModel);
    }
}
