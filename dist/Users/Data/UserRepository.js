import { Repository } from '../../Core/Data/Repository';
import { UserModel } from './UserModel';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
}
