import { NotFoundError, Service } from '../../core/index.js';
import { CourseRequestModel } from '../Data/CourseRequestModel.js';
import { CourseRequestRepository } from '../Data/CourseRequestRepository.js';
export class DealsService extends Service {
    courseRequestRepository;
    constructor() {
        super();
        this.courseRequestRepository = new CourseRequestRepository();
    }
    async create(email, courseId) {
        this.courseRequestRepository.create(new CourseRequestModel({ email, courseId }));
    }
    async remove(email) {
        const courseRequest = await this.courseRequestRepository.findOne({
            email,
        });
        if (!courseRequest) {
            throw new NotFoundError('Course request not found');
        }
        this.courseRequestRepository.delete(courseRequest.id);
    }
}
