import { Service } from '../../Core/Services/Service';
import { NotFoundError } from '../../Core/Errors/NotFoundError';
import { CourseRequestModel } from '../Data/CourseRequestModel';
import { CourseRequestRepository } from '../Data/CourseRequestRepository';
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
