import { NotFoundError, Pagination, UnauthorizedError } from '@core'
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
import { StudentFromAnotherMentorError } from '../Errors/StudentFromAnotherMentorError'
import { WorkRepository } from '@modules/Works/Data/WorkRepository'
import { AssignedWorkComment } from '../Data/Relations/AssignedWorkComment'

export class AssignedWorkService {
	private readonly assignedWorkRepository: AssignedWorkRepository
	private readonly workRepository: WorkRepository
	private readonly userRepository: UserRepository

	constructor() {
		this.assignedWorkRepository = new AssignedWorkRepository()
		this.workRepository = new WorkRepository()
		this.userRepository = new UserRepository()
	}

	public async getWorks(
		userId: User['id'],
		userRole: User['role'],
		pagination?: Pagination
	) {
		const condition =
			userRole == 'student'
				? { student: { id: userId } }
				: { mentors: { id: userId } }

		return await this.assignedWorkRepository.find(
			condition as any,
			undefined,
			pagination
		)
	}

	public async getWorkBySlug(slug: AssignedWork['slug']) {
		const work = await this.assignedWorkRepository.findOne({ slug })

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async getWorkById(id: AssignedWork['id']) {
		const work = await this.assignedWorkRepository.findOne({ id })

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async createWork(
		assignedWork: AssignedWork,
		mentorId: User['id']
	) {
		const mentor = await this.userRepository.findOne({ id: mentorId }, {
			students: true,
		} as any)
		const work = await this.workRepository.findOne({
			id: assignedWork.workId,
		})

		if (
			!mentor!.students?.some(
				(student) => student.id === assignedWork.studentId
			)
		) {
			throw new StudentFromAnotherMentorError()
		}

		if (!work) {
			throw new NotFoundError()
		}

		assignedWork.student = { id: assignedWork.studentId as any } as any
		assignedWork.mentors = [{ id: mentorId } as any]
		assignedWork.work = { id: assignedWork.workId as any } as any
		assignedWork.maxScore = this.getMaxScore(work.tasks || [])

		return this.assignedWorkRepository.create(assignedWork)
	}

	public async solveWork(work: AssignedWork) {
		const foundWork = await this.assignedWorkRepository.findOne({
			id: work.id,
		})

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

		// check if its been solved in deadline
		let solveStatus: AssignedWork['solveStatus']

		if (
			foundWork.solveDeadlineAt &&
			new Date() > foundWork.solveDeadlineAt
		) {
			solveStatus = 'made-after-deadline'
		} else {
			solveStatus = 'made-in-deadline'
		}

		work.solveStatus = solveStatus
		work.solvedAt = new Date()

		const newWork = new AssignedWorkModel({ ...foundWork, ...work })

		return this.assignedWorkRepository.update(newWork)
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

		// check if its been solved in deadline
		let checkStatus: AssignedWork['checkStatus']

		if (
			foundWork.checkDeadlineAt &&
			new Date() > foundWork.checkDeadlineAt
		) {
			checkStatus = 'checked-after-deadline'
		} else {
			checkStatus = 'checked-in-deadline'
		}

		work.checkStatus = checkStatus
		work.checkedAt = new Date()
		work.score = this.getScore(work.comments)

		const newWork = new AssignedWorkModel({ ...foundWork, ...work })

		return this.assignedWorkRepository.update(newWork)
	}

	public async transferWorkToAnotherMentor(
		workId: AssignedWork['id'],
		mentorId: AssignedWork['mentorIds'][0]
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

		// as any to trick ts because we need only the id not the entire entity
		foundWork.mentors = [...foundWork.mentorIds, mentorId] as any[]

		return this.assignedWorkRepository.update(foundWork)
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

			work.solveDeadlineAt.setDate(
				work.solveDeadlineAt.getDate() + days
			)
		} else {
			if (!work.mentors!.some((mentor) => mentor.id === userId)) {
				throw new UnauthorizedError()
			}

			if (!work.checkDeadlineAt) {
				throw new CheckDeadlineNotSetError()
			}

			work.checkDeadlineAt.setDate(
				work.checkDeadlineAt.getDate() + days
			)
		}

		return this.assignedWorkRepository.update(work)
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

		return this.assignedWorkRepository.delete(id)
	}

	private getMaxScore(tasks: AssignedWork['work']['tasks']) {
		return tasks.reduce((acc, task) => acc + task.highestScore, 0)
	}

	private getScore(comments: AssignedWorkComment[]) {
		return comments.reduce((acc, comment) => acc + comment.score, 0)
	}
}
