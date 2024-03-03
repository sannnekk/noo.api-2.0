import { NotFoundError, Service } from '@core'
import { CourseRequestModel } from '../Data/CourseRequestModel'
import { CourseRequest } from '../Data/CourseRequest'
import { CourseRequestRepository } from '../Data/CourseRequestRepository'

export class DealsService extends Service<CourseRequestModel> {
	private readonly courseRequestRepository: CourseRequestRepository

	public constructor() {
		super()

		this.courseRequestRepository = new CourseRequestRepository()
	}

	public async create(
		email: CourseRequest['email'],
		courseId: CourseRequest['id']
	) {
		this.courseRequestRepository.create(
			new CourseRequestModel({ email, courseId })
		)
	}

	public async remove(email: string) {
		const courseRequest = await this.courseRequestRepository.findOne({
			email,
		})

		if (!courseRequest) {
			throw new NotFoundError('Course request not found')
		}

		this.courseRequestRepository.delete(courseRequest.id)
	}
}
