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
            const userCount = await this.userRepository.count();
            results.push({
                label: 'Users',
                status: userCount > 0 ? 'ok' : 'warning',
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
