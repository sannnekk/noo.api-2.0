import { AssignedWork } from '@modules/AssignedWorks/Data/AssignedWork'
import { Pagination } from '@modules/Core/Data/Pagination'
import { Service } from '@modules/Core/Services/Service'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { CalenderEvent } from '../Data/CalenderEvent'
import { CalenderEventRepository } from '../Data/CalenderEventRepository'
import { User } from '@modules/Users/Data/User'
import { CalenderEventModel } from '../Data/CalenderEventModel'

export class CalenderService extends Service<CalenderEvent> {
	private readonly calenderEventRepository: CalenderEventRepository

	constructor() {
		super()

		this.calenderEventRepository = new CalenderEventRepository()
	}

	public async create(
		event: CalenderEvent,
		username: User['username']
	): Promise<void> {
		await this.calenderEventRepository.create({ ...event, username })
	}

	public async updateDeadlineFromWork(
		work: AssignedWork,
		type: 'student-deadline' | 'mentor-deadline'
	): Promise<void> {
		const newDate =
			type === 'student-deadline'
				? work.solveDeadlineAt
				: work.checkDeadlineAt

		const event = await this.calenderEventRepository.findOne({
			assignedWork: {
				id: work.id,
			},
			type,
		})

		if (!event || !newDate) {
			return
		}

		event.date = newDate
		event.description =
			event.description + ' (Дедлайн сдивнут на эту дату)'

		await this.calenderEventRepository.update(event)
	}

	public async get(
		username: User['username'],
		pagination?: Pagination
	) {
		const condition = { username }
		const events = await this.calenderEventRepository.find(
			condition,
			undefined,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.calenderEventRepository,
			condition,
			pagination || new Pagination(),
			[]
		)

		return { events, meta }
	}

	public async getOne(
		id: CalenderEvent['id'],
		username: User['username']
	): Promise<CalenderEvent | null> {
		const event = await this.calenderEventRepository.findOne({ id })

		if (event && event?.username !== username) {
			throw new UnauthorizedError()
		}

		return event
	}

	public async update(
		id: CalenderEvent['id'],
		event: Partial<CalenderEvent>,
		username: User['username']
	): Promise<void> {
		const foundEvent = await this.calenderEventRepository.findOne({
			id,
		})

		if (foundEvent && foundEvent?.username !== username) {
			throw new UnauthorizedError()
		}

		await this.calenderEventRepository.update({ ...event, id })
	}

	public async delete(
		id: CalenderEvent['id'],
		username: User['username']
	): Promise<void> {
		const foundEvent = await this.calenderEventRepository.findOne({
			id,
		})

		if (foundEvent && foundEvent?.username !== username) {
			throw new UnauthorizedError()
		}

		await this.calenderEventRepository.delete(id)
	}

	public async createSolveDeadlineEvent(
		work: AssignedWork
	): Promise<void> {
		await this.calenderEventRepository.create({
			title: 'Дедлайн по работе',
			description: `Работа: ${work.work.name}`,
			date: work.solveDeadlineAt!,
			url: `/assigned-works/${work.id}/solve`,
			visibility: 'all',
			type: 'student-deadline',
			username: work.student!.username,
			assignedWork: work,
		} as CalenderEvent)
	}

	public async createCheckDeadlineEvent(
		work: AssignedWork
	): Promise<void> {
		await Promise.all(
			(work.mentors || []).map((mentor) => {
				return this.calenderEventRepository.create(
					new CalenderEventModel({
						title: 'Дедлайн по проверке работы',
						description: `Работа: ${work.work.name}`,
						date: work.checkDeadlineAt!,
						url: `/assigned-works/${work.id}/check`,
						visibility: 'private',
						type: 'mentor-deadline',
						username: mentor.username,
						assignedWork: work,
					})
				)
			})
		)
	}

	public async createWorkMadeEvent(work: AssignedWork): Promise<void> {
		await this.calenderEventRepository.create(
			new CalenderEventModel({
				title: 'Работа сдана',
				description: `Работа: ${work.work.name}`,
				date: work.solvedAt!,
				url: `/assigned-works/${work.id}/read`,
				visibility: 'all',
				type: 'work-made',
				username: work.student!.username,
				assignedWork: work,
			})
		)
	}

	public async createWorkCheckedEvent(
		work: AssignedWork
	): Promise<void> {
		await Promise.all(
			(work.mentors || []).map((mentor) => {
				return this.calenderEventRepository.create(
					new CalenderEventModel({
						title: 'Работа проверена',
						description: `Работа: ${work.work.name}`,
						date: work.checkedAt!,
						url: `/assigned-works/${work.id}/read`,
						visibility: 'private',
						type: 'work-checked',
						username: mentor.username,
						assignedWork: work,
					})
				)
			})
		)
	}
}
