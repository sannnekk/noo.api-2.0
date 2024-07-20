import { Repository } from '../../Core/Data/Repository.js';
import { SessionModel } from './SessionModel.js';
export class SessionRepository extends Repository {
    constructor() {
        super(SessionModel);
    }
}
