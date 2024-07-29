import { Repository } from '@modules/Core/Data/Repository'
import { PollQuestion } from './Relations/PollQuestion'
import { PollQuestionModel } from './Relations/PollQuestionModel'

export class PollQuestionRepository extends Repository<PollQuestion> {
  public constructor() {
    super(PollQuestionModel)
  }
}
