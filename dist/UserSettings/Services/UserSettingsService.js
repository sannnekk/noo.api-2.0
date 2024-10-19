import { UserSettingsRepository } from '../Data/UserSettingsRepository.js';
export class UserSettingsService {
    userSettingsRepository;
    constructor() {
        this.userSettingsRepository = new UserSettingsRepository();
    }
    async getSettings(userId) {
        return this.userSettingsRepository.findOne({ user: { id: userId } });
    }
    async updateSettings(userId, settings) {
        const userSettings = await this.userSettingsRepository.findOne({
            user: { id: userId },
        });
        if (userSettings) {
            return this.userSettingsRepository.update({
                ...settings,
                user: {
                    id: userId,
                },
                id: userSettings.id,
            });
        }
        return this.userSettingsRepository.create({
            ...settings,
            user: {
                id: userId,
            },
        });
    }
}
