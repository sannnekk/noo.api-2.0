import { Repository } from '../../core/index';
import { UserModel } from './UserModel';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
}
