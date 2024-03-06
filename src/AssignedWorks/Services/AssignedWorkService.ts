import {
	NotFoundError,
	Pagination,
	Service,
	UnauthorizedError,
} from '@core'
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

export class AssignedWorkService extends Service<AssignedWork> {
	private readonly assignedWorkRepository: AssignedWorkRepository
	private readonly workRepository: WorkRepository
	private readonly userRepository: UserRepository

	constructor() {
		super()

		this.assignedWorkRepository = new AssignedWorkRepository()
		this.workRepository = new WorkRepository()
		this.userRepository = new UserRepository()
	}

	public async getWorks(
		userId: User['id'],
		userRole: User['role'],
		pagination?: Pagination
	) {
		const conditions: any =
			userRole == 'student'
				? { student: { id: userId } }
				: { mentors: { id: userId } }

		pagination = new Pagination().assign(pagination)
		// TODO: entries to search
		pagination.entriesToSearch = []

		const relations = ['student' as const]

		const assignedWorks = await this.assignedWorkRepository.find(
			conditions,
			relations,
			pagination
		)

		this.storeRequestMeta(
			this.assignedWorkRepository,
			conditions,
			relations,
			pagination
		)

		return assignedWorks
	}

	public async getWorkBySlug(slug: AssignedWork['slug']) {
		const work = await this.assignedWorkRepository.findOne({ slug }, [
			'student',
			'mentors',
		])

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async getWorkById(id: AssignedWork['id']) {
		const work = await this.assignedWorkRepository.findOne({ id }, [
			'mentors',
			'student',
		])

		if (!work) {
			throw new NotFoundError()
		}

		return work
	}

	public async createWork(
		assignedWork: AssignedWork,
		mentorId: User['id']
	) {
		const work = await this.workRepository.findOne({
			id: assignedWork.workId,
		})

		const student = await this.userRepository.findOne({
			id: assignedWork.studentId,
		})

		if (!work || !student) {
			throw new NotFoundError()
		}

		assignedWork.student = { id: assignedWork.studentId as any } as any
		assignedWork.mentors = [{ id: student.mentorId } as any]
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

		if (
			foundWork.solveDeadlineAt &&
			new Date() > foundWork.solveDeadlineAt
		) {
			work.solveStatus = 'made-after-deadline'
		} else {
			work.solveStatus = 'made-in-deadline'
		}

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

		if (
			foundWork.checkDeadlineAt &&
			new Date() > foundWork.checkDeadlineAt
		) {
			work.checkStatus = 'checked-after-deadline'
		} else {
			work.checkStatus = 'checked-in-deadline'
		}

		work.checkedAt = new Date()
		work.score = this.getScore(work.comments)

		const newWork = new AssignedWorkModel({ ...foundWork, ...work })

		return this.assignedWorkRepository.update(newWork)
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

		return this.assignedWorkRepository.update(work)
	}

	public async archiveWork(id: AssignedWork['id']) {
		const foundWork = await this.assignedWorkRepository.findOne({ id })

		if (!foundWork) {
			throw new NotFoundError()
		}

		foundWork.isArchived = true

		return this.assignedWorkRepository.update(foundWork)
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
