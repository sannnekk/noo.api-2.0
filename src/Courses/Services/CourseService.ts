import { UserRepository } from '@modules/Users/Data/UserRepository'
import { CourseRepository } from './../Data/CourseRepository'
import { Course } from '../Data/Course'
import {
	AlreadyExistError,
	NotFoundError,
	Pagination,
	Service,
	UnknownError,
} from '@core'
import { QueryFailedError } from 'typeorm'
import { CourseModel } from '../Data/CourseModel'
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository'
import { User } from '@modules/Users/Data/User'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkService } from '@modules/AssignedWorks/Services/AssignedWorkService'
import { CourseMaterial } from '../Data/Relations/CourseMaterial'

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

		if (userRole === 'student') {
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

		// Clear chapters and materials as they are not needed in the list
		for (const course of courses) {
			course.chapters = []
		}

		return courses
	}

	public async getBySlug(slug: string): Promise<Course> {
		const course = await this.courseRepository.findOne({ slug }, [
			'chapters.materials.work' as any,
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
		const course = await this.courseRepository.findOne(
			{
				slug: courseSlug,
			},
			['chapters.materials.work' as any]
		)

		if (!course) {
			throw new NotFoundError()
		}

		const newStudentIds = studentIds.filter(
			(id) => !(course.studentIds || []).includes(id)
		)

		course.students = studentIds.map((id) => ({ id } as User))

		try {
			await this.courseRepository.updateRaw(course)
		} catch (e: any) {
			throw new UnknownError('Не удалось обновить список учеников')
		}

		const materials = (course.chapters || [])
			.flatMap((chapter) => chapter.materials)
			.filter(Boolean) as CourseMaterial[]

		await Promise.all(
			materials.map((material) =>
				this.assignWorkToStudents(newStudentIds, material)
			)
		)
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
			['chapter.course' as any]
		)

		if (!material) {
			throw new NotFoundError()
		}

		material.work = workId as any
		material.workSolveDeadline = solveDeadline
		material.workCheckDeadline = checkDeadline

		await this.assignWorkToStudents(
			material.chapter?.course?.studentIds || [],
			material
		)

		await this.materialRepository.update(material)
	}

	public async assignWorkToStudents(
		studentIds: User['id'][],
		material: CourseMaterial
	): Promise<void> {
		await Promise.all(
			studentIds.map((id) => this.assignWorkToStudent(id, material))
		)
	}

	public async assignWorkToStudent(
		studentId: User['id'],
		material: CourseMaterial
	) {
		if (!material.work) return

		try {
			await this.assignedWorkService.createWork({
				studentId,
				workId: material.work.id,
				solveDeadlineAt: material.workSolveDeadline,
				checkDeadlineAt: material.workCheckDeadline,
			} as AssignedWork)
		} catch (e: any) {}
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

		course.chapters = this.sortChapters(course).chapters!.map(
			(chapter) => {
				chapter.materials = (chapter.materials || []).sort(
					(a, b) => a.order - b.order
				)

				return chapter
			}
		)

		return course
	}

	private sortChapters(course: Course): Course {
		course.chapters = (course.chapters || []).sort(
			(a, b) => a.order - b.order
		)

		return course
	}
}
