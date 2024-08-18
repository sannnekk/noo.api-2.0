import { CourseRequestRepository } from '../Data/CourseRequestRepository.js';
export class DealsService {
    courseRequestRepository;
    constructor() {
        this.courseRequestRepository = new CourseRequestRepository();
    }
    async create(email, courseId) {
        /* this.courseRequestRepository.create(
          new CourseRequestModel({ email, courseId })
        ) */
        return { email, courseId };
    }
    async remove(email) {
        return email;
        /* const courseRequest = await this.courseRequestRepository.findOne({
          email,
        })
    
        if (!courseRequest) {
          throw new NotFoundError('Course request not found')
        }
    
        this.courseRequestRepository.delete(courseRequest.id) */
    }
}
