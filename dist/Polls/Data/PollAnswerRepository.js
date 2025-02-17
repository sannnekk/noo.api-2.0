import { Repository } from '../../Core/Data/Repository.js';
import { PollAnswerModel } from './Relations/PollAnswerModel.js';
export class PollAnswerRepository extends Repository {
    constructor() {
        super(PollAnswerModel);
    }
    async getMyPollIds(userId) {
        const query = await this.queryBuilder('poll_answer')
            .select('DISTINCT poll.id', 'id')
            .leftJoin('poll_answer.question', 'question')
            .leftJoin('question.poll', 'poll')
            .where('poll_answer.userId = :userId', { userId });
        const values = await query.getRawMany();
        return values.map((value) => value.id);
    }
}
