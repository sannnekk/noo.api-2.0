import { Repository } from '../../Core/Data/Repository.js';
import { PollModel } from './PollModel.js';
export class PollRepository extends Repository {
    constructor() {
        super(PollModel);
    }
    async addVotedUser(pollId, userId) {
        await this.queryBuilder()
            .relation(PollModel, 'votedUsers')
            .of(pollId)
            .add(userId);
    }
}
