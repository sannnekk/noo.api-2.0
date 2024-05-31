import { Service } from '@modules/Core/Services/Service'
import { Poll } from '../Data/Poll'
import { PollRepository } from '../Data/PollRepository'
import { PollAnswerRepository } from '../Data/PollAnswerRepository'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { PollAnswer } from '../Data/Relations/PollAnswer'
import { PollAnswerModel } from '../Data/Relations/PollAnswerModel'
import { User } from '@modules/Users/Data/User'

export class PollService extends Service<Poll | PollAnswer> {
	private readonly pollRepository: PollRepository
	private readonly pollAnswerRepository: PollAnswerRepository

	constructor() {
		super()

		this.pollRepository = new PollRepository()
		this.pollAnswerRepository = new PollAnswerRepository()
	}

	public async getPollById(id: Poll['id']): Promise<Poll> {
		const poll = await this.pollRepository.findOne({ id }, ['questions'])

		if (!poll) {
			throw new NotFoundError('Опрос не найден')
		}

		return poll
	}

	public async getAnswers(pollId: Poll['id'], pagination: Pagination) {
		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = PollAnswerModel.entriesToSearch()

		const relations = [] as (keyof PollAnswer)[]
		const conditions: Partial<PollAnswer> = {
			poll: {
				id: pollId,
			} as Poll,
		}

		const answers = await this.pollAnswerRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.pollAnswerRepository,
			conditions,
			pagination,
			relations
		)

		return { answers, meta }
	}

	public async saveAnswers(
		userId: User['id'],
		pollId: Poll['id'],
		answers: PollAnswer[]
	) {}
}
