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

export class AssignedWorkService extends Service<AssignedWork> {
	private readonly taskService: TaskService
	private readonly assignedWorkRepository: AssignedWorkRepository
	private readonly workRepository: WorkRepository
	private readonly userRepository: UserRepository
	private readonly answerRepository: AssignedWorkAnswerRepository
	private readonly commentRepository: AssignedWorkCommentRepository

	constructor() {
		super()

		this.taskService = new TaskService()
		this.assignedWorkRepository = new AssignedWorkRepository()
		this.workRepository = new WorkRepository()
		this.userRepository = new UserRepository()
		this.answerRepository = new AssignedWorkAnswerRepository()
		this.commentRepository = new AssignedWorkCommentRepository()
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

		const relations = [
			'work' as const,
			'student' as const,
			'mentors' as const,
		]

		const assignedWorks = await this.assignedWorkRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.assignedWorkRepository,
			conditions,
			pagination,
			relations
		)

		return { assignedWorks, meta }
	}

	public async getWorkById(id: AssignedWork['id'], role: User['role']) {
		const work = await this.assignedWorkRepository.findOne(
			{ id },
			['mentors', 'student', 'work.tasks' as any],
			{
				work: {
					tasks: {
						order: 'ASC',
					},
				},
			}
		)

		if (!work) {
			throw new NotFoundError()
		}

		if (work.solveStatus !== 'not-started') {
			const answers = await this.answerRepository.find({
				assignedWorkId: work.id,
			})

			work.answers = answers
		}

		if (
			(work.checkStatus === 'in-progress' && role === 'mentor') ||
			work.checkStatus === 'checked-in-deadline' ||
			work.checkStatus === 'checked-after-deadline'
		) {
			const comments = await this.commentRepository.find({
				assignedWorkId: work.id,
			})

			work.comments = comments
		}

		return work
	}

	public async createWork(assignedWork: AssignedWork) {
		const work = await this.workRepository.findOne(
			{
				id: assignedWork.workId,
			},
			['tasks']
		)

		const student = await this.userRepository.findOne(
			{
				id: assignedWork.studentId,
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

		assignedWork.work = { id: work.id } as Work
		assignedWork.student = { id: student.id } as User
		assignedWork.mentors = [{ id: student.mentor.id } as User]
		assignedWork.maxScore = this.getMaxScore(work.tasks || [])

		await this.assignedWorkRepository.create(assignedWork)

		// await this.calenderService.createFromWork(createdWork)
	}

	public async solveWork(work: AssignedWork) {
		const foundWork = await this.assignedWorkRepository.findOne(
			{
				id: work.id,
			},
			['work', 'work.tasks' as any]
		)

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (
			['made-in-deadline', 'made-after-deadline'].includes(
				foundWork.solveStatus
			)
		) {
			throw new WorkAlreadySolvedError()
		}

		if (
			foundWork.solveDeadlineAt &&
			new Date() > foundWork.solveDeadlineAt
		) {
			foundWork.solveStatus = 'made-after-deadline'
		} else {
			foundWork.solveStatus = 'made-in-deadline'
		}

		foundWork.solvedAt = new Date()
		foundWork.comments = this.taskService.automatedCheck(
			foundWork.work.tasks,
			work.answers
		)

		if (foundWork.work.tasks.every((task) => task.type !== 'text')) {
			foundWork.checkStatus = 'checked-in-deadline'
			foundWork.checkedAt = new Date()
			foundWork.score = this.getScore(foundWork.comments)
		}

		await this.assignedWorkRepository.update(foundWork)
	}

	public async checkWork(work: AssignedWork) {
		const foundWork = await this.assignedWorkRepository.findOne({
			id: work.id,
		})

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

		if (
			['not-started', 'in-progress'].includes(foundWork.solveStatus)
		) {
			throw new WorkIsNotSolvedYetError()
		}

		if (
			foundWork.checkDeadlineAt &&
			new Date() > foundWork.checkDeadlineAt
		) {
			foundWork.checkStatus = 'checked-after-deadline'
		} else {
			foundWork.checkStatus = 'checked-in-deadline'
		}

		foundWork.checkedAt = new Date()
		foundWork.score = this.getScore(work.comments)

		await this.assignedWorkRepository.update(foundWork)
	}

	public async saveProgress(work: AssignedWork, role: User['role']) {
		const foundWork = await this.assignedWorkRepository.findOne({
			id: work.id,
		})

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

		foundWork.answers = work.answers
		foundWork.comments = work.comments || []

		await this.assignedWorkRepository.update(foundWork)
	}

	public async archiveWork(id: AssignedWork['id']) {
		const foundWork = await this.assignedWorkRepository.findOne({ id })

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
		const foundWork = await this.assignedWorkRepository.findOne({
			id: workId,
		})

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
		})
		const newMentor = await this.userRepository.findOne({
			id: mentorId,
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
		const work = await this.assignedWorkRepository.findOne({ id })

		if (!work) {
			throw new NotFoundError()
		}

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

			work.solveDeadlineAt.setDate(
				work.solveDeadlineAt.getDate() + days
			)
			work.solveDeadlineShifted = true
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

			work.checkDeadlineAt.setDate(
				work.checkDeadlineAt.getDate() + days
			)
			work.checkDeadlineShifted = true
		}

		//await this.calenderService.updateDeadlineFromWork(work)

		await this.assignedWorkRepository.update(work)
	}

	public async deleteWork(
		id: AssignedWork['id'],
		mentorId: User['id']
	) {
		const foundWork = await this.assignedWorkRepository.findOne({ id })

		if (!foundWork) {
			throw new NotFoundError()
		}

		if (!foundWork.mentors!.some((mentor) => mentor.id === mentorId)) {
			throw new UnauthorizedError()
		}

		await this.assignedWorkRepository.delete(id)
	}

	private getMaxScore(tasks: AssignedWork['work']['tasks']) {
		return tasks.reduce((acc, task) => acc + task.highestScore, 0)
	}

	private getScore(comments: AssignedWorkComment[]) {
		return comments.reduce((acc, comment) => acc + comment.score, 0)
	}
}
