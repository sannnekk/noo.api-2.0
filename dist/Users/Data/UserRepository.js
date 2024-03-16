import { Repository } from '@core';
import { UserModel } from './UserModel';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
}
