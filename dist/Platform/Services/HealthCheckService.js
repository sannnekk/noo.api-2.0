import { UserRepository } from '../../Users/Data/UserRepository.js';
export class HealthCheckService {
    userRepository;
    constructor() {
        this.userRepository = new UserRepository();
    }
    async healthcheck() {
        const results = [
            {
                label: 'Event loop',
                status: 'ok',
            },
        ];
        try {
            const user = await this.userRepository.findOne({
                username: 'akjcbdytceuiocbjdcjsbskcdbc7689sidbjchsd',
            });
            results.push({
                label: 'Database: User table check',
                status: user === null ? 'ok' : 'warning',
            });
        }
        catch (error) {
            results.push({
                label: 'Database: ' + error.message,
                status: 'error',
            });
        }
        return results;
    }
}
