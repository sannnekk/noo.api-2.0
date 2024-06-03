import { Repository } from '../../Core/Data/Repository.js';
import { PollModel } from './PollModel.js';
export class PollRepository extends Repository {
    constructor() {
        super(PollModel);
    }
}
