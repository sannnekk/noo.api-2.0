import { Repository } from '../../Core/Data/Repository';
import { PollModel } from './PollModel';
export class PollRepository extends Repository {
    constructor() {
        super(PollModel);
    }
}
