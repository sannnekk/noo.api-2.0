import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { Service } from '../../Core/Services/Service.js';
import { UserRepository } from '../../Users/Data/UserRepository.js';
import { InvalidTelegramHashError } from '../Errors/InvalidTelegramHashError.js';
export class TelegramService extends Service {
    userRepository;
    constructor() {
        super();
        this.userRepository = new UserRepository();
    }
    async bindTelegram(userId, bindingData) {
        const user = await this.userRepository.findOne({ id: userId });
        if (!user) {
            throw new NotFoundError('Пользователь не найден');
        }
        if (!this.validateTelegramHash(bindingData.hash)) {
            throw new InvalidTelegramHashError();
        }
        user.telegramUsername = bindingData.telegramUsername;
        user.telegramId = bindingData.telegramId;
        await this.userRepository.update(user);
    }
    async unbindTelegram(userId) {
        const user = await this.userRepository.findOne({ id: userId });
        if (!user) {
            throw new NotFoundError('Пользователь не найден');
        }
        user.telegramId = null;
        user.telegramUsername = null;
        await this.userRepository.update(user);
    }
    validateTelegramHash(hash) {
        // TODO: Implement hash validation
        return hash.length > 0;
    }
}
