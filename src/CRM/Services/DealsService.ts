import { CourseRequest } from '../Data/CourseRequest'
import { CourseRequestRepository } from '../Data/CourseRequestRepository'

export class DealsService {
  private readonly courseRequestRepository: CourseRequestRepository

  public constructor() {
    this.courseRequestRepository = new CourseRequestRepository()
  }

  public async create(
    email: CourseRequest['email'],
    courseId: CourseRequest['id']
  ) {
    /* this.courseRequestRepository.create(
      new CourseRequestModel({ email, courseId })
    ) */

    return { email, courseId }
  }

  public async remove(email: string) {
    return email
    /* const courseRequest = await this.courseRequestRepository.findOne({
      email,
    })

    if (!courseRequest) {
      throw new NotFoundError('Course request not found')
    }

    this.courseRequestRepository.delete(courseRequest.id) */
  }
}
