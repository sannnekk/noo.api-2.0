import { Repository } from '../../Core/Data/Repository.js';
import { PollAnswerModel } from './Relations/PollAnswerModel.js';
export class PollAnswerRepository extends Repository {
    constructor() {
        super(PollAnswerModel);
    }
}
