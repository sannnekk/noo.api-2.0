import { Repository } from '../../Core/Data/Repository.js';
import { CourseModel } from './CourseModel.js';
export class CourseRepository extends Repository {
    constructor() {
        super(CourseModel);
    }
    async getAuthors(courseId) {
        return this.queryBuilder().relation('authors').of(courseId).loadMany();
    }
}
