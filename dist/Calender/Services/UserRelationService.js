import { UserRepository } from '../../Users/Data/UserRepository.js';
export class UserRelationService {
    userRepository;
    visibilities = {
        all: () => true,
        private: (requester, target) => requester.username === target.username,
        'own-mentor': (requester, target) => false,
        'all-mentors': (requester, target) => false,
        'own-students': (requester, target) => false,
    };
    constructor() {
        this.userRepository = new UserRepository();
    }
    async getUserToUserVisibilities(requester, target) {
        const requesterUser = await this.userRepository.findOne({
            where: { username: requester },
        });
        const targetUser = await this.userRepository.findOne({
            where: { username: target },
        });
        if (!requesterUser || !targetUser) {
            return [];
        }
        const visibilities = Object.keys(this.visibilities);
        return visibilities.filter((key) => this.visibilities[key].call(undefined, requesterUser, targetUser));
    }
}
