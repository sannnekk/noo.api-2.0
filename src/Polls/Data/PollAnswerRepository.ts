import { Repository } from '@modules/Core/Data/Repository'
import { PollAnswer } from './Relations/PollAnswer'
import { PollAnswerModel } from './Relations/PollAnswerModel'

export class PollAnswerRepository extends Repository<PollAnswer> {
  public constructor() {
    super(PollAnswerModel)
  }

  public async getMyPollIds(userId: string): Promise<string[]> {
    const query = await this.queryBuilder('poll_answer')
      .select('DISTINCT poll.id', 'id')
      .leftJoin('poll_answer.question', 'question')
      .leftJoin('question.poll', 'poll')
      .where('poll_answer.userId = :userId', { userId })

    const values: { id: string }[] = await query.getRawMany()

    return values.map((value) => value.id)
  }
}
