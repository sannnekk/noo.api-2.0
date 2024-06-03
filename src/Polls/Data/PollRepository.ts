import { Repository } from '@modules/Core/Data/Repository'
import { Poll } from './Poll'
import { PollModel } from './PollModel'

export class PollRepository extends Repository<Poll> {
	public constructor() {
		super(PollModel)
	}
}
