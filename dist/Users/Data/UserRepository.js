import { Repository } from '../../Core/Data/Repository.js';
import { UserModel } from './UserModel.js';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
    async getRandomMentor() {
        return this.queryBuilder('user').orderBy('RAND()').getOne();
    }
}
