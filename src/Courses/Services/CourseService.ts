import { UserRepository } from '@modules/Users/Data/UserRepository'
import { CourseRepository } from './../Data/CourseRepository'
import { Course } from '../Data/Course'
import {
	AlreadyExistError,
	NotFoundError,
	Pagination,
	Service,
} from '@core'
import { QueryFailedError } from 'typeorm'
import { CourseModel } from '../Data/CourseModel'
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository'
import { User } from '@modules/Users/Data/User'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkService } from '@modules/AssignedWorks/Services/AssignedWorkService'

export class CourseService extends Service<Course> {
	private readonly courseRepository: CourseRepository
	private readonly materialRepository: CourseMaterialRepository
	private readonly userRepository: UserRepository
	private readonly assignedWorkService: AssignedWorkService

	constructor() {
		super()

		this.courseRepository = new CourseRepository()
		this.userRepository = new UserRepository()
		this.materialRepository = new CourseMaterialRepository()
		this.assignedWorkService = new AssignedWorkService()
	}

	public async get(
		pagination: Pagination | undefined,
		userId: User['id'],
		userRole: User['role']
	): Promise<Course[]> {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = CourseModel.entriesToSearch()

		let conditions = undefined

		if (userRole !== 'student') {
			conditions = {
				students: {
					id: userId,
				} as any,
			}
		}

		const courses = await this.courseRepository.find(
			conditions,
			undefined,
			pagination
		)

		this.storeRequestMeta(
			this.courseRepository,
			conditions,
			[],
			pagination
		)

		return courses
	}

	public async getBySlug(slug: string): Promise<Course> {
		const course = await this.courseRepository.findOne({ slug }, [
			'chapters.materials.work' as any,
			'students',
		])

		if (!course) {
			throw new NotFoundError()
		}

		return this.sortMaterials(course)
	}

	public async getAssignedWorkToMaterial(
		materialSlug: string,
		userId: User['id']
	): Promise<AssignedWork | null> {
		const user = await this.userRepository.findOne(
			{
				id: userId,
			},
			['assignedWorksAsStudent.work.materials' as any]
		)

		if (!user) return null

		return (
			user.assignedWorksAsStudent?.find((assignedWork) =>
				assignedWork.work?.materials?.some(
					(material) => material.slug === materialSlug
				)
			) || null
		)
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

	public async assignStudents(
		courseSlug: Course['slug'],
		studentIds: User['id'][]
	) {
		const course = await this.courseRepository.findOne({
			slug: courseSlug,
		})
		const students = await this.userRepository.find(
			studentIds.map((id) => ({ id })) as any
		)

		if (!course) {
			throw new NotFoundError()
		}

		course.students = students

		await this.courseRepository.update(course)
	}

	public async assignWorkToMaterial(
		materialSlug: string,
		workId: string,
		solveDeadline?: Date | undefined,
		checkDeadline?: Date | undefined
	) {
		const material = await this.materialRepository.findOne(
			{
				slug: materialSlug,
			},
			['chapter.course.students.mentor' as any]
		)

		if (!material) {
			throw new NotFoundError()
		}

		material.work = workId as any

		for (const student of material.chapter?.course?.students || []) {
			if (!student.mentorId) continue

			await this.assignedWorkService.createWork(
				{
					studentId: student.id,
					workId,
					solveDeadlineAt: solveDeadline,
					checkDeadlineAt: checkDeadline,
				} as AssignedWork,
				student.mentorId
			)
		}

		await this.materialRepository.update(material)
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

	private sortMaterials(course: Course): Course {
		if (!course.chapters) return course

		course.chapters = course.chapters.map((chapter) => {
			if (!chapter.materials) return chapter

			chapter.materials = chapter.materials.sort(
				(a, b) => a.order - b.order
			)

			return chapter
		})

		return course
	}
}
