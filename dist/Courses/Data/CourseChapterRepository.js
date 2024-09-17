import { Repository } from '../../Core/Data/Repository.js';
import { CourseChapterModel } from './Relations/CourseChapterModel.js';
export class CourseChapterRepository extends Repository {
    constructor() {
        super(CourseChapterModel);
    }
}
