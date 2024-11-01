import { Repository } from '../../Core/Data/Repository.js';
import { UserModel } from './UserModel.js';
export class UserRepository extends Repository {
    constructor() {
        super(UserModel);
    }
    async usernameExists(username) {
        return this.repository.exists({
            where: {
                username,
            },
        });
    }
    async emailExists(email) {
        return this.repository.exists({
            where: {
                email,
            },
        });
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
    async findIds(conditions) {
        return (await this.repository.find({ where: conditions, select: ['id'] })).map((user) => user.id);
    }
    async getStudentsWithAssignments(courseId, pagination) {
        const query = this.queryBuilder('user')
            .leftJoinAndSelect('user.courseAssignments', 'courseAssignment', 'courseAssignment.courseId = :courseId', { courseId })
            .where('user.role = :role', { role: 'student' })
            .take(pagination.take)
            .skip(pagination.offset)
            .orderBy('user.id', 'DESC');
        if (pagination.searchQuery && typeof pagination.searchQuery === 'string') {
            new UserModel().addSearchToQuery(query, pagination.searchQuery);
        }
        const [entities, total] = await query.getManyAndCount();
        return {
            entities,
            meta: {
                total,
                relations: ['courseAssignments'],
            },
        };
    }
}
