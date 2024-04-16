import { UserRepository } from '@modules/Users/Data/UserRepository'
import { CalenderEvent } from '../Data/CalenderEvent'
import { User } from '@modules/Users/Data/User'

export class UserRelationService {
	private readonly userRepository: UserRepository

	private visibilities: Record<
		CalenderEvent['visibility'],
		(requester: User, target: User) => boolean
	> = {
		all: () => true,
		private: (requester, target) =>
			requester.username === target.username,
		'own-mentor': (requester, target) => false,
		'all-mentors': (requester, target) => false,
		'own-students': (requester, target) => false,
	}

	constructor() {
		this.userRepository = new UserRepository()
	}

	public async getUserToUserVisibilities(
		requester: string,
		target: string
	): Promise<CalenderEvent['visibility'][]> {
		const requesterUser = await this.userRepository.findOne({
			username: requester,
		})

		const targetUser = await this.userRepository.findOne({
			username: target,
		})

		if (!requesterUser || !targetUser) {
			return []
		}

		const visibilities = Object.keys(
			this.visibilities
		) as CalenderEvent['visibility'][]

		return visibilities.filter((key) =>
			this.visibilities[key].call(undefined, requesterUser, targetUser)
		) as CalenderEvent['visibility'][]
	}
}
