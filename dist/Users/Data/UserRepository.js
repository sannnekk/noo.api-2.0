import { Repository } from '../../core/index.js';
import { UserModel } from './UserModel.js';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
}
