import { Service } from '@modules/Core/Services/Service'
import { Poll } from '../Data/Poll'
import { PollRepository } from '../Data/PollRepository'
import { PollAnswerRepository } from '../Data/PollAnswerRepository'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Pagination } from '@modules/Core/Data/Pagination'
import { PollAnswer } from '../Data/Relations/PollAnswer'
import { PollAnswerModel } from '../Data/Relations/PollAnswerModel'
import { User } from '@modules/Users/Data/User'
import { AlreadyVotedError } from '../Errors/AlreadyVotedError'
import { CantVoteInPollError } from '../Errors/CantVoteInPollError'
import { UnauthorizedError } from '@modules/core/Errors/UnauthorizedError'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { UserModel } from '@modules/Users/Data/UserModel'

export class PollService extends Service<Poll | PollAnswer | User> {
	private readonly pollRepository: PollRepository
	private readonly pollAnswerRepository: PollAnswerRepository
	private readonly userRepository: UserRepository

	constructor() {
		super()

		this.pollRepository = new PollRepository()
		this.pollAnswerRepository = new PollAnswerRepository()
		this.userRepository = new UserRepository()
	}

	public async getPollById(id: Poll['id']): Promise<Poll> {
		const poll = await this.pollRepository.findOne({ id }, ['questions'])

		if (!poll) {
			throw new NotFoundError('Опрос не найден')
		}

		return poll
	}

	public async getPollInfo(id: Poll['id']): Promise<Poll> {
		const poll = await this.pollRepository.findOne({ id })

		if (!poll) {
			throw new NotFoundError('Опрос не найден')
		}

		return poll
	}

	public async searchWhoVoted(
		userRole: User['role'],
		pollId: Poll['id'],
		pagination: Pagination
	) {
		if (!(await this.canSeeResults(userRole, pollId))) {
			throw new UnauthorizedError()
		}

		pagination = new Pagination().assign(pagination)
		pagination.entriesToSearch = UserModel.entriesToSearch()

		const relations = [] as (keyof User)[]
		const conditions = {
			votedPolls: {
				id: pollId,
			} as unknown as Poll[],
		}

		const users = await this.userRepository.find(
			conditions,
			relations,
			pagination
		)

		const meta = await this.getRequestMeta(
			this.userRepository,
			conditions,
			pagination,
			relations
		)

		return { users, meta }
	}

	public async getAnswers(
		userRole: User['role'],
		pollId: Poll['id'],
		userId: User['id']
	) {
		if (!(await this.canSeeResults(userRole, pollId))) {
			throw new UnauthorizedError()
		}

		const relations = [] as (keyof PollAnswer)[]
		const conditions: Partial<PollAnswer> = {
			question: {
				poll: {
					id: pollId,
				},
			},
			user: {
				id: userId,
			} as User,
		} as any

		const answers = await this.pollAnswerRepository.find(conditions, relations)

		return answers
	}

	public async saveAnswers(
		userId: User['id'],
		userRole: User['role'],
		pollId: Poll['id'],
		answers: PollAnswer[]
	): Promise<void> {
		if (!(await this.canVote(userRole, pollId))) {
			throw new CantVoteInPollError()
		}

		if (await this.userAlreadyVoted(userId, pollId)) {
			throw new AlreadyVotedError()
		}

		const poll = await this.pollRepository.findOne({ id: pollId }, [
			'votedUsers',
		])

		if (!poll) {
			throw new NotFoundError()
		}

		// TODO: add user more efficient
		poll.votedUsers!.push({ id: userId } as User)

		const answerModels = answers.map(
			(answer) =>
				new PollAnswerModel({ ...answer, user: { id: userId } as User })
		)

		this.pollRepository.update(poll)
		this.pollAnswerRepository.createMany(answerModels)
	}

	public async editAnswer(
		id: PollAnswer['id'],
		data: PollAnswer
	): Promise<void> {
		const answer = await this.pollAnswerRepository.findOne({ id })

		if (!answer) {
			throw new NotFoundError('Ответ не найден')
		}

		const newAnswer = new PollAnswerModel({ ...answer, ...data, id })

		await this.pollAnswerRepository.update(newAnswer)
	}

	private async userAlreadyVoted(
		userId: User['id'],
		pollId: Poll['id']
	): Promise<boolean> {
		const answerCount = await this.pollAnswerRepository.count({
			question: {
				poll: {
					id: pollId,
				},
			},
			user: {
				id: userId,
			},
		})

		return answerCount > 0
	}

	private async canVote(
		role: User['role'],
		pollId: Poll['id']
	): Promise<boolean> {
		const poll = await this.pollRepository.findOne({
			id: pollId,
		})

		if (!poll) {
			throw new NotFoundError('Опрос не найден')
		}

		return poll.canVote.includes(role) || poll.canVote.includes('everyone')
	}

	private async canSeeResults(
		role: User['role'],
		pollId: Poll['id']
	): Promise<boolean> {
		const poll = await this.pollRepository.findOne({
			id: pollId,
		})

		if (!poll) {
			throw new NotFoundError('Опрос не найден')
		}

		return (
			poll.canSeeResults.includes(role) ||
			poll.canSeeResults.includes('everyone')
		)
	}
}
