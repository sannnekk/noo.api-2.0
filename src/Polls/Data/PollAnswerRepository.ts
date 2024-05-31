import { Repository } from '@modules/Core/Data/Repository'
import { PollAnswer } from './Relations/PollAnswer'
import { PollAnswerModel } from './Relations/PollAnswerModel'

export class PollAnswerRepository extends Repository<PollAnswer> {
	public constructor() {
		super(PollAnswerModel)
	}
}
