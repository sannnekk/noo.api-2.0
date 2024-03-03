import { Pagination, Service } from '@core'
import { CalenderEvent } from '../Data/CalenderEvent'
import { CalenderEventRepository } from '../Data/CalenderEventRepository'

export class CalenderService extends Service<CalenderEvent> {
	private readonly calenderEventRepository: CalenderEventRepository

	constructor() {
		super()

		this.calenderEventRepository = new CalenderEventRepository()
	}

	public async create(event: CalenderEvent): Promise<void> {
		await this.calenderEventRepository.create(event)
	}

	public async get(pagination?: Pagination): Promise<CalenderEvent[]> {
		const events = this.calenderEventRepository.find(
			undefined,
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
		id: CalenderEvent['id']
	): Promise<CalenderEvent | null> {
		return this.calenderEventRepository.findOne({ id })
	}

	public async update(
		id: CalenderEvent['id'],
		event: Partial<CalenderEvent>
	): Promise<void> {
		await this.calenderEventRepository.update({ ...event, id })
	}
}
