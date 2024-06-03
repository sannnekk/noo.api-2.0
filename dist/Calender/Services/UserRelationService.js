import { UserRepository } from '../../Users/Data/UserRepository.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
export class UserRelationService {
    userRepository;
    visibilities = {
        all: () => true,
        private: (requester, target) => requester.username === target.username,
        'own-mentor': (requester, target) => {
            return (requester.role === 'mentor' && requester.id === target.mentorId);
        },
        'all-mentors': (requester, target) => {
            return requester.role === 'mentor';
        },
        'own-students': (requester, target) => {
            return !!(requester.role === 'student' && requester.mentorId === target.id);
        },
    };
    constructor() {
        this.userRepository = new UserRepository();
    }
    async getUserToUserVisibilities(requester, target) {
        const visibilities = Object.keys(this.visibilities);
        if (requester.username === target.username) {
            return visibilities;
        }
        return visibilities.filter((key) => this.visibilities[key](requester, target));
    }
    async getCondition(requester, target) {
        const requesterUser = await this.userRepository.findOne({
            username: requester,
        }, ['mentor', 'students']);
        if (!requesterUser) {
            throw new NotFoundError('Пользователь не найден.');
        }
        const targetUser = await this.userRepository.findOne({
            username: target,
        }, ['mentor', 'students']);
        if (!targetUser) {
            throw new NotFoundError('Пользователь не найден');
        }
        const visibilities = await this.getUserToUserVisibilities(requesterUser, targetUser);
        const conditions = visibilities.map((visibility) => ({
            visibility,
            username: target,
        }));
        conditions.push(...this.addRelativeUserConditions(targetUser));
        return conditions;
    }
    addRelativeUserConditions(target) {
        const conditions = [];
        switch (target.role) {
            case 'student':
                if (!target.mentor) {
                    return conditions;
                }
                conditions.push({
                    username: target.mentor.username,
                    visibility: 'own-students',
                });
                conditions.push({
                    username: target.mentor.username,
                    visibility: 'all',
                });
                break;
            case 'mentor':
                if (!target.students) {
                    return conditions;
                }
                for (const student of target.students) {
                    conditions.push({
                        username: student.username,
                        visibility: 'own-mentor',
                    });
                }
                break;
        }
        return conditions;
    }
}
