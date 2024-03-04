import { Pagination, Service, UnauthorizedError } from '@core'
import { CalenderEvent } from '../Data/CalenderEvent'
import { CalenderEventRepository } from '../Data/CalenderEventRepository'
import { User } from '@modules/Users/Data/User'

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

	public async get(
		username: User['username'],
		pagination?: Pagination
	): Promise<CalenderEvent[]> {
		const events = this.calenderEventRepository.find(
			{
				username,
			},
			undefined,
			pagination
		)

		this.storeRequestMeta(
			this.calenderEventRepository,
			undefined,
			undefined,
			pagination
		)

		return events
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
}
