import { CourseRequest } from '../Data/CourseRequest'
import { CourseRequestRepository } from '../Data/CourseRequestRepository'
import log from '@modules/Core/Logs/Logger'

export class DealsService {
  private readonly courseRequestRepository: CourseRequestRepository

  public constructor() {
    this.courseRequestRepository = new CourseRequestRepository()
  }

  public async create(
    email: CourseRequest['email'],
    courseId: CourseRequest['id']
  ) {
    log('debug', 'Creating course request in Service')
    log('debug', { email, courseId })
    /* this.courseRequestRepository.create(
      new CourseRequestModel({ email, courseId })
    ) */
  }

  public async remove(email: string) {
    log('debug', 'Removing course request in Service')
    log('debug', { email })

    return
    /* const courseRequest = await this.courseRequestRepository.findOne({
      email,
    })

    if (!courseRequest) {
      throw new NotFoundError('Course request not found')
    }

    this.courseRequestRepository.delete(courseRequest.id) */
  }
}
