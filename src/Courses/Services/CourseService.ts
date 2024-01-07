import { UserRepository } from '@modules/Users/Data/UserRepository'
import { CourseRepository } from './../Data/CourseRepository'
import { Course } from '../Data/Course'
import {
	AlreadyExistError,
	NotFoundError,
	Pagination,
	Transliteration,
	ULID,
} from '@core'
import { QueryFailedError } from 'typeorm'
import { CourseChapterModel } from '../Data/Relations/CourseChapterModel'
import { CourseModel } from '../Data/CourseModel'

export class CourseService {
	private readonly courseRepository: CourseRepository
	private readonly userRepository: UserRepository

	constructor() {
		this.courseRepository = new CourseRepository()
		this.userRepository = new UserRepository()
	}

	public async get(pagination?: Pagination): Promise<Course[]> {
		return this.courseRepository.find(undefined, undefined, pagination)
	}

	public async getBySlug(slug: string): Promise<Course> {
		const course = await this.courseRepository.findOne({ slug })

		if (!course) {
			throw new NotFoundError()
		}

		return course
	}

	public async update(course: Course): Promise<void> {
		const foundCourse = await this.courseRepository.findOne({
			id: course.id,
		})

		if (!foundCourse) {
			throw new NotFoundError()
		}

		const newCourse = new CourseModel({ ...foundCourse, ...course })

		await this.courseRepository.update(newCourse)
	}

	public async create(
		course: Course,
		authorId: Course['authorId']
	): Promise<void> {
		const author = await this.userRepository.findOne({ id: authorId })

		course.author = author!

		try {
			await this.courseRepository.create(course)
		} catch (error: any) {
			if (error instanceof QueryFailedError) {
				throw new AlreadyExistError()
			}
		}
	}

	public async delete(id: Course['id']): Promise<void> {
		await this.courseRepository.delete(id)
	}
}
