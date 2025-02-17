import { Repository } from '@modules/Core/Data/Repository'
import type { Poll } from './Poll'
import { PollModel } from './PollModel'
import type { User } from '@modules/Users/Data/User'

export class PollRepository extends Repository<Poll> {
  public constructor() {
    super(PollModel)
  }

  public async addVotedUser(pollId: Poll['id'], userId: User['id']) {
    await this.queryBuilder()
      .relation(PollModel, 'votedUsers')
      .of(pollId)
      .add(userId)
  }
}
