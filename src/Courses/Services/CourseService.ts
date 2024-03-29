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

		// Clear chapters, students and materials as they are not needed in the list
		for (const course of courses) {
			course.chapters = []
			course.studentIds = []
		}

		return { courses, meta }
	}

	public async getBySlug(slug: string): Promise<Course> {
		const course = await this.courseRepository.findOne(
			{ slug },
			['chapters.materials.work' as any],
			{
				chapters: {
					order: 'ASC',
					materials: {
						order: 'ASC',
					},
				},
			}
		)

		if (!course) {
			throw new NotFoundError()
		}

		return course
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

		course.students = studentIds.map((id) => ({ id } as User))

		try {
			await this.courseRepository.updateRaw(course)
		} catch (e: any) {
			throw new UnknownError('Не удалось обновить список учеников')
		}

		/* if (newStudentIds.length === 0) return

		const materials = (course.chapters || [])
			.flatMap((chapter) => chapter.materials)
			.filter(Boolean) as CourseMaterial[]

		const students = await this.userRepository.find(
			newStudentIds.map((id) => ({ id }))
		)

		for (const material of materials) {
			console.log(
				'Assigning work to students',
				students.map((s) => s.username),
				material.name
			)
			await this.assignWorkToStudents(students, material)
		} */
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
}
