import { Repository } from '../../Core/Data/Repository.js';
import { UserModel } from './UserModel.js';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
    async getIdsFromEmails(emails, condition) {
        const query = await this.queryBuilder('user')
            .select('user.id')
            .where('user.email IN (:...emails)', { emails });
        if (condition) {
            for (const [key, value] of Object.entries(condition)) {
                query.andWhere(`user.${key} = :${key}`, { [key]: value });
            }
        }
        const users = await query.getMany();
        return users.map((user) => user.id);
    }
}
