import { Repository } from '../../Core/Data/Repository.js';
import { PollQuestionModel } from './Relations/PollQuestionModel.js';
export class PollQuestionRepository extends Repository {
    constructor() {
        super(PollQuestionModel);
    }
}
