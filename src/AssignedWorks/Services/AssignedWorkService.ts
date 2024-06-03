import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { Service } from '@modules/Core/Services/Service'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { AssignedWorkRepository } from '../Data/AssignedWorkRepository'
import { AssignedWork } from '../Data/AssignedWork'
import { AssignedWorkModel } from '../Data/AssignedWorkModel'
import { WorkAlreadySolvedError } from '../Errors/WorkAlreadySolvedError'
import { WorkAlreadyCheckedError } from '../Errors/WorkAlreadyCheckedError'
import { WorkIsNotSolvedYetError } from '../Errors/WorkIsNotSolvedYetError'
import { WorkAlreadyAssignedToThisMentorError } from '../Errors/WorkAlreadyAssignedToThisMentorError'
import { WorkAlreadyAssignedToEnoughMentorsError } from '../Errors/WorkAlreadyAssignedToEnoughMentorsError'
import { User } from '@modules/Users/Data/User'
import { SolveDeadlineNotSetError } from '../Errors/SolveDeadlineNotSetError'
import { CheckDeadlineNotSetError } from '../Errors/CheckDeadlineNotSetError'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { WorkRepository } from '@modules/Works/Data/WorkRepository'
import { AssignedWorkComment } from '../Data/Relations/AssignedWorkComment'
import { DeadlineAlreadyShiftedError } from '../Errors/DeadlineAlreadyShiftedError'
import { WorkIsArchived } from '../Errors/WorkIsArchived'
import { TaskService } from './TaskService'
import { Work } from '@modules/Works/Data/Work'
import { CalenderService } from '@modules/Calender/Services/CalenderService'
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository'
import { AssignedWorkAnswerRepository } from '../Data/AssignedWorkAnswerRepository'
import { CourseMaterial } from '@modules/Courses/Data/Relations/CourseMaterial'
import { CourseMaterialRepository } from '@modules/Courses/Data/CourseMaterialRepository'
import { RemakeOptions } from '../DTO/RemakeOptions'
import { CreateOptions } from '../DTO/CreateOptions'
import { SolveOptions } from '../DTO/SolveOptions'
import { CheckOptions } from '../DTO/CheckOptions'
import { SaveOptions } from '../DTO/SaveOptions'

export class AssignedWorkService extends Service<AssignedWork> {
	private readonly taskService: TaskService
	private readonly assignedWorkRepository: AssignedWorkRepository
	private readonly materialRepository: CourseMaterialRepository
	private readonly workRepository: WorkRepository
	private readonly userRepository: UserRepository
	private readonly answerRepository: AssignedWorkAnswerRepository
	private readonly commentRepository: AssignedWorkCommentRepository
	private readonly calenderService: CalenderService

	constructor() {
		super()

		this.taskService = new TaskService()
		this.assignedWorkRepository = new AssignedWorkRepository()
		this.materialRepository = new CourseMaterialRepository()
		this.workRepository = new WorkRepository()
		this.userRepository = new UserRepository()
		this.answerRepository = new AssignedWorkAnswerRepository()
		this.commentRepository = new AssignedWorkCommentRepository()
		this.calenderService = new CalenderService()
	}

	public async getWorks(
		userId: User['id'],
		userRole: User['role'],
		pagination?: Pagination
	) {
		// TODO: modify the conditions to load all assigned mentors instead of just one
		const conditions: any =
			userRole == 'student'
				? { student: { id: userId } }
				: { mentors: { id: userId } }

		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = AssignedWorkModel.entriesToSearch()

		const relations = ['work', 'student', 'mentors'] as const

		const assignedWorks = await this.assignedWorkRepository.find(
			conditions,
			relations,
			pagination
		)

		for (const work of assignedWorks) {
			if (work.isNewAttempt && work.work) {
				work.work.name = `[Пересдача] ${work.work.name}`
			}
		}

		const meta = await this.getRequestMeta(
			this.assignedWorkRepository,
			conditions,
			pagination,
			relations
		)

		return { assignedWorks, meta }
	}

	public async getWorkById(id: AssignedWork['id'], role: User['role']) {
		const assignedWork = await this.assignedWorkRepository.findOne(
			{ id },
			['mentors', 'student', 'work.tasks'],
			{
				work: {
					tasks: {
						order: 'ASC',
					},
				},
			}
		)

		if (!assignedWork) {
			throw new NotFoundError()
		}

		assignedWork.answers = []
		assignedWork.comments = []

		this.excludeTasks(assignedWork)

		if (assignedWork.isNewAttempt) {
			assignedWork.work.name = `[Пересдача] ${assignedWork.work.name}`
		}

		if (assignedWork.solveStatus !== 'not-started') {
			const answers = await this.answerRepository.findAll({
				assignedWorkId: assignedWork.id,
			})

			assignedWork.answers = answers
		}

		if (
			(assignedWork.checkStatus === 'in-progress' && role === 'mentor') ||
			(assignedWork.checkStatus === 'not-checked' && role === 'mentor') ||
			assignedWork.checkStatus === 'checked-in-deadline' ||
			assignedWork.checkStatus === 'checked-after-deadline' ||
			assignedWork.checkStatus === 'checked-automatically'
		) {
			const comments = await this.commentRepository.findAll({
				assignedWorkId: assignedWork.id,
			})

			assignedWork.comments = comments
		}

		return assignedWork
	}

	public async createWork(
		options: CreateOptions,
		taskIdsToExclude: string[] = []
	) {
		const work = await this.workRepository.findOne(
			{
				id: options.workId,
			},
			['tasks']
		)

		const student = await this.userRepository.findOne(
			{
				id: options.studentId,
			},
			['mentor']
		)

		if (!work) {
			throw new NotFoundError('Работа не найдена')
		}

		if (!student) {
			throw new NotFoundError('Ученик не найден')
		}

		if (!student.mentor) {
			throw new NotFoundError('У ученика нет куратора')
		}

		const assignedWork = new AssignedWorkModel()

		assignedWork.work = { id: work.id } as Work
		assignedWork.student = { id: student.id } as User
		assignedWork.mentors = [{ id: student.mentor.id } as User]
		assignedWork.excludedTaskIds = taskIdsToExclude
		assignedWork.maxScore = this.getMaxScore(work.tasks, taskIdsToExclude)

		const createdWork = await this.assignedWorkRepository.create(assignedWork)

		work.tasks = []

		createdWork.student = student
		createdWork.mentors = [student.mentor]
		createdWork.work = work

		if (assignedWork.solveDeadlineAt) {
			await this.calenderService.createSolveDeadlineEvent(createdWork)
		}

		if (assignedWork.checkDeadlineAt) {
			await this.calenderService.createCheckDeadlineEvent(createdWork)
		}

		return createdWork
	}

	public async remakeWork(
		assignedWorkId: AssignedWork['id'],
		studentId: User['id'],
		options: RemakeOptions
	) {
		const assignedWork = await this.getAssignedWork(assignedWorkId, ['work'])

		if (!assignedWork) {
			throw new NotFoundError('Работа не найдена')
		}

		if (assignedWork.isArchived) {
			throw new WorkIsArchived('Работа архивирована и не может быть пересдана')
		}

		if (!assignedWork.work) {
			throw new NotFoundError('Работа не найдена. Возможно, она была удалена')
		}

		if (assignedWork.studentId !== studentId) {
			throw new UnauthorizedError('Вы не можете пересдать чужую работу')
		}

		let rightTaskIds: string[] = assignedWork.excludedTaskIds

		if (options.onlyFalse) {
			const comments = await this.commentRepository.findAll(
				{
					assignedWorkId,
				},
				['task']
			)

			const newExcludes = comments
				.filter((comment) => comment.task?.highestScore === comment.score)
				.map((comment) => comment.task?.id)
				.filter(Boolean) as string[]

			rightTaskIds.push(...newExcludes)
		}

		this.createWork(
			{
				workId: assignedWork.work.id,
				studentId,
				isNewAttempt: true,
			} as AssignedWork,
			rightTaskIds
		)
	}

	public async getOrCreateWork(
		materialSlug: CourseMaterial['slug'],
		studentId: AssignedWork['studentId']
	): Promise<{ link: string }> {
		const material = await this.materialRepository.findOne(
			{ slug: materialSlug },
			['work']
		)

		if (!material) {
			throw new NotFoundError('Материал не найден')
		}

		const workId = material.work?.id

		if (!workId) {
			throw new NotFoundError('У этого материала нет работы')
		}

		const assignedWork = await this.assignedWorkRepository.findOne({
			work: { id: workId },
			student: { id: studentId },
		})

		if (assignedWork) {
			switch (assignedWork.solveStatus) {
				case 'in-progress':
					return { link: `/assigned-works/${assignedWork.id}/solve` }
				case 'made-in-deadline':
					return { link: `/assigned-works/${assignedWork.id}/read` }
				case 'made-after-deadline':
					return { link: `/assigned-works/${assignedWork.id}/read` }
				case 'not-started':
				default:
					return { link: `/assigned-works/${assignedWork.id}/solve` }
			}
		}

		const createdWork = await this.createWork({
			studentId,
			workId,
			checkDeadlineAt: material.workCheckDeadline,
			solveDeadlineAt: material.workSolveDeadline,
		} as AssignedWork)

		return { link: `/assigned-works/${createdWork.id}/solve` }
	}

	public async solveWork(
		assignedWorkId: AssignedWork['id'],
		solveOptions: SolveOptions,
		studentId: User['id']
	) {
		const foundWork = await this.getAssignedWork(assignedWorkId, [
			'work',
			'work.tasks' as any,
			'student',
		])

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (foundWork.studentId !== studentId) {
			throw new UnauthorizedError('Вы не можете решить чужую работу')
		}

		if (
			['made-in-deadline', 'made-after-deadline'].includes(
				foundWork.solveStatus
			)
		) {
			throw new WorkAlreadySolvedError()
		}

		if (foundWork.solveDeadlineAt && new Date() > foundWork.solveDeadlineAt) {
			foundWork.solveStatus = 'made-after-deadline'
		} else {
			foundWork.solveStatus = 'made-in-deadline'
		}

		foundWork.solvedAt = new Date()
		foundWork.answers = solveOptions.answers
		foundWork.comments = this.taskService.automatedCheck(
			foundWork.work.tasks,
			solveOptions.answers
		)

		if (foundWork.work.tasks.every((task) => task.type !== 'text')) {
			foundWork.checkStatus = 'checked-automatically'
			foundWork.checkedAt = new Date()
			foundWork.score = this.getScore(foundWork.comments)
		}

		await this.assignedWorkRepository.update(foundWork)

		await this.calenderService.createWorkMadeEvent(foundWork)
	}

	public async checkWork(
		assignedWorkId: AssignedWork['id'],
		checkOptions: CheckOptions
	) {
		const foundWork = await this.getAssignedWork(assignedWorkId, [
			'work',
			'mentors',
		])

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (
			['checked-in-deadline', 'checked-after-deadline'].includes(
				foundWork.checkStatus
			)
		) {
			throw new WorkAlreadyCheckedError()
		}

		if (['not-started', 'in-progress'].includes(foundWork.solveStatus)) {
			throw new WorkIsNotSolvedYetError()
		}

		if (foundWork.checkDeadlineAt && new Date() > foundWork.checkDeadlineAt) {
			foundWork.checkStatus = 'checked-after-deadline'
		} else {
			foundWork.checkStatus = 'checked-in-deadline'
		}

		foundWork.answers = checkOptions.answers || []
		foundWork.comments = checkOptions.comments || []
		foundWork.checkedAt = new Date()
		foundWork.score = this.getScore(foundWork.comments)

		await this.assignedWorkRepository.update(foundWork)
		await this.calenderService.createWorkCheckedEvent(foundWork)
	}

	public async saveProgress(
		assignedWorkId: AssignedWork['id'],
		saveOptions: SaveOptions,
		role: User['role']
	) {
		const foundWork = await this.getAssignedWork(assignedWorkId)

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (foundWork.isArchived) {
			throw new WorkIsArchived()
		}

		if (role == 'student') {
			if (
				foundWork.solveStatus === 'made-in-deadline' ||
				foundWork.solveStatus === 'made-after-deadline'
			) {
				throw new WorkAlreadySolvedError()
			}

			foundWork.solveStatus = 'in-progress'
		} else if (role == 'mentor') {
			if (
				foundWork.checkStatus === 'checked-in-deadline' ||
				foundWork.checkStatus === 'checked-after-deadline'
			) {
				throw new WorkAlreadyCheckedError()
			}

			if (
				foundWork.solveStatus === 'not-started' ||
				foundWork.solveStatus === 'in-progress'
			) {
				throw new WorkIsNotSolvedYetError()
			}

			foundWork.checkStatus = 'in-progress'
		}

		foundWork.answers = saveOptions.answers
		foundWork.comments = saveOptions.comments || []

		await this.assignedWorkRepository.update(foundWork)
	}

	public async archiveWork(id: AssignedWork['id']) {
		const foundWork = await this.getAssignedWork(id)

		if (!foundWork) {
			throw new NotFoundError()
		}

		foundWork.isArchived = true

		await this.assignedWorkRepository.update(foundWork)
	}

	public async transferWorkToAnotherMentor(
		workId: AssignedWork['id'],
		mentorId: AssignedWork['mentorIds'][0],
		currentMentorId: User['id']
	) {
		const foundWork = await this.getAssignedWork(workId)

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (foundWork.mentorIds.includes(mentorId)) {
			throw new WorkAlreadyAssignedToThisMentorError()
		}

		if (foundWork.mentorIds.length >= 2) {
			throw new WorkAlreadyAssignedToEnoughMentorsError()
		}

		const mentor = await this.userRepository.findOne({
			id: currentMentorId,
			role: 'mentor',
		})

		const newMentor = await this.userRepository.findOne({
			id: mentorId,
			role: 'mentor',
		})

		if (!mentor || !newMentor) {
			throw new NotFoundError('Куратор не найден')
		}

		foundWork.mentors = [mentor, newMentor]

		await this.assignedWorkRepository.update(foundWork)
	}

	public async shiftDeadline(
		id: AssignedWork['id'],
		days: number,
		role: Exclude<User['role'], 'teacher' | 'admin'>,
		userId: User['id']
	) {
		const work = await this.getAssignedWork(id, ['mentors'])

		if (role == 'student') {
			if (work.studentId !== userId) {
				throw new UnauthorizedError()
			}

			if (!work.solveDeadlineAt) {
				throw new SolveDeadlineNotSetError()
			}

			if (work.solveDeadlineShifted) {
				throw new DeadlineAlreadyShiftedError()
			}

			work.solveDeadlineAt.setDate(work.solveDeadlineAt.getDate() + days)
			work.solveDeadlineShifted = true

			await this.calenderService.updateDeadlineFromWork(
				work,
				'student-deadline'
			)
		} else {
			if (!work.mentors!.some((mentor) => mentor.id === userId)) {
				throw new UnauthorizedError()
			}

			if (!work.checkDeadlineAt) {
				throw new CheckDeadlineNotSetError()
			}

			if (work.checkDeadlineShifted) {
				throw new DeadlineAlreadyShiftedError()
			}

			work.checkDeadlineAt.setDate(work.checkDeadlineAt.getDate() + days)
			work.checkDeadlineShifted = true

			await this.calenderService.updateDeadlineFromWork(work, 'mentor-deadline')
		}

		await this.assignedWorkRepository.update(work)
	}

	public async deleteWork(id: AssignedWork['id'], mentorId: User['id']) {
		const foundWork = await this.assignedWorkRepository.findOne({ id })

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (!foundWork.mentors!.some((mentor) => mentor.id === mentorId)) {
			throw new UnauthorizedError()
		}

		await this.assignedWorkRepository.delete(id)
	}

	private async getAssignedWork(
		id: AssignedWork['id'],
		relations: (keyof AssignedWork)[] = []
	) {
		const assignedWork = await this.assignedWorkRepository.findOne(
			{ id },
			relations
		)

		if (!assignedWork) {
			throw new NotFoundError('Работа не найдена')
		}

		this.excludeTasks(assignedWork)

		return assignedWork
	}

	private excludeTasks(assignedWork: AssignedWork) {
		const tasksToExclude = assignedWork.excludedTaskIds

		if (tasksToExclude.length && assignedWork?.work?.tasks) {
			assignedWork.work.tasks = assignedWork.work.tasks.filter(
				(task) => !tasksToExclude.includes(task.id)
			)
		}
	}

	private getMaxScore(
		tasks: AssignedWork['work']['tasks'],
		excludedTaskIds: string[] = []
	) {
		const filteredTasks = tasks.filter(
			(task) => !excludedTaskIds.includes(task.id)
		)

		return filteredTasks.reduce((acc, task) => acc + task.highestScore, 0)
	}

	private getScore(comments: AssignedWorkComment[]) {
		return comments.reduce((acc, comment) => acc + comment.score, 0)
	}
}
