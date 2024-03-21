import { UserRepository } from '@modules/Users/Data/UserRepository'
import { CourseRepository } from './../Data/CourseRepository'
import { Course } from '../Data/Course'
import { AlreadyExistError } from '@modules/Core/Errors/AlreadyExistError'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { UnknownError } from '@modules/Core/Errors/UnknownError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { Service } from '@modules/Core/Services/Service'
import { QueryFailedError } from 'typeorm'
import { CourseModel } from '../Data/CourseModel'
import { CourseMaterialRepository } from '../Data/CourseMaterialRepository'
import { User } from '@modules/Users/Data/User'
import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { AssignedWorkService } from '@modules/AssignedWorks/Services/AssignedWorkService'
import { CourseMaterial } from '../Data/Relations/CourseMaterial'
import { AssignedWorkRepository } from '@modules/AssignedWorks/Data/AssignedWorkRepository'

export class CourseService extends Service<Course> {
	private readonly courseRepository: CourseRepository
	private readonly materialRepository: CourseMaterialRepository
	private readonly userRepository: UserRepository
	private readonly assignedWorkService: AssignedWorkService
	private readonly assignedWorkRepository: AssignedWorkRepository

	constructor() {
		super()

		this.courseRepository = new CourseRepository()
		this.userRepository = new UserRepository()
		this.materialRepository = new CourseMaterialRepository()
		this.assignedWorkService = new AssignedWorkService()
		this.assignedWorkRepository = new AssignedWorkRepository()
	}

	public async get(
		pagination: Pagination | undefined,
		userId: User['id'],
		userRole: User['role']
	) {
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

		const meta = await this.getRequestMeta(
			this.courseRepository,
			conditions,
			pagination,
			[]
		)

		// Clear chapters and materials as they are not needed in the list
		for (const course of courses) {
			course.chapters = []
		}

		return { courses, meta }
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
		const assignedWork = await this.assignedWorkRepository.findOne({
			student: {
				id: userId,
			},
			work: {
				materials: {
					slug: materialSlug,
				},
			},
		})

		return assignedWork
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

	public async assignMeWorks(
		courseSlug: Course['slug'],
		userId: User['id']
	) {
		const materials = await this.materialRepository.find({
			chapter: {
				course: {
					slug: courseSlug,
				},
			},
		} as any)

		const user = await this.userRepository.findOne({ id: userId })

		if (!user) {
			throw new NotFoundError('Пользователь не найден')
		}

		for (const material of materials) {
			await this.assignWorkToStudents([user], material)
		}
	}

	public async assignStudents(
		courseSlug: Course['slug'],
		studentIds: User['id'][]
	) {
		const course = await this.courseRepository.findOne(
			{
				slug: courseSlug,
			},
			['chapters.materials' as any]
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

		const students = await this.userRepository.find(
			newStudentIds.map((id) => ({ id }))
		)

		for (const material of materials) {
			await this.assignWorkToStudents(students, material)
		}
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

		material.work = { id: workId } as any
		material.workId = workId
		material.workSolveDeadline = solveDeadline
		material.workCheckDeadline = checkDeadline

		const students = await this.userRepository.find(
			(material.chapter?.course?.studentIds || []).map((id) => ({ id }))
		)

		await this.materialRepository.update(material)
		await this.assignWorkToStudents(students, material)
	}

	public async assignWorkToStudents(
		students: User[],
		material: CourseMaterial
	): Promise<void> {
		if (!material.workId) return

		try {
			await this.assignedWorkService.createWorks(
				students,
				material.workId,
				material.workSolveDeadline,
				material.workCheckDeadline
			)
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
