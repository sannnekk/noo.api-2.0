import { Repository } from '../../Core/Data/Repository';
import { PollAnswerModel } from './Relations/PollAnswerModel';
export class PollAnswerRepository extends Repository {
    constructor() {
        super(PollAnswerModel);
    }
}
