import { Service } from '../../Core/Services/Service.js';
import { CourseRequestRepository } from '../Data/CourseRequestRepository.js';
import log from '../../Core/Logs/Logger.js';
export class DealsService extends Service {
    courseRequestRepository;
    constructor() {
        super();
        this.courseRequestRepository = new CourseRequestRepository();
    }
    async create(email, courseId) {
        log('debug', 'Creating course request in Service');
        log('debug', { email, courseId });
        /* this.courseRequestRepository.create(
          new CourseRequestModel({ email, courseId })
        ) */
    }
    async remove(email) {
        log('debug', 'Removing course request in Service');
        log('debug', { email });
        return;
        /* const courseRequest = await this.courseRequestRepository.findOne({
          email,
        })
    
        if (!courseRequest) {
          throw new NotFoundError('Course request not found')
        }
    
        this.courseRequestRepository.delete(courseRequest.id) */
    }
}
