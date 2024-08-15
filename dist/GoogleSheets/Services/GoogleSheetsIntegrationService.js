import { GoogleSheetsBindingRepository } from '../Data/GoogleSheetsBindingRepository.js';
import { GoogleSheetsBindingModel } from '../Data/GoogleSheetsBindingModel.js';
import { GoogleAuthService } from './Google/GoogleAuthService.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { BindingSyncService } from './BindingSyncService.js';
export class GoogleSheetsIntegrationService {
    googleSheetsBindingRepository;
    googleAuthService;
    bindingSyncService;
    constructor() {
        this.googleSheetsBindingRepository = new GoogleSheetsBindingRepository();
        this.googleAuthService = new GoogleAuthService();
        this.bindingSyncService = new BindingSyncService();
    }
    /**
     * Get google docs bindings with pagination
     *
     * @param pagination
     * @returns
     */
    async getBindings(pagination) {
        return this.googleSheetsBindingRepository.search(undefined, pagination);
    }
    /**
     * Create a binding
     *
     * @param data
     */
    async createBinding(data) {
        const { refresh_token: refreshToken, id_token: idToken } = await this.googleAuthService.getTokens(data.googleOAuthToken, data.googleRefreshToken);
        const authCredentials = await this.googleAuthService.getAuthDataFromIdToken(idToken);
        const binding = new GoogleSheetsBindingModel({
            ...data,
            status: 'active',
            googleRefreshToken: refreshToken,
            googleOAuthToken: refreshToken ? null : data.googleOAuthToken,
            googleCredentials: authCredentials || null,
        });
        await this.googleSheetsBindingRepository.create(binding);
    }
    /**
     * Trigger a binding by id
     *
     * @param id binding id
     */
    async triggerBinding(id) {
        const binding = await this.googleSheetsBindingRepository.findOne({ id });
        if (!binding) {
            throw new NotFoundError('Интеграция не найдена');
        }
        binding.lastRunAt = new Date();
        try {
            const filePath = await this.bindingSyncService.sync(binding);
            binding.filePath = filePath;
            binding.lastErrorText = null;
            binding.googleOAuthToken = null;
            binding.status = 'active';
        }
        catch (error) {
            binding.status = 'error';
            binding.lastErrorText = error.message;
        }
        finally {
            await this.googleSheetsBindingRepository.update(binding);
        }
    }
    /**
     * Switch on/off a binding by id
     *
     * @param id binding id
     */
    async switchOnOffBinding(id) {
        const binding = await this.googleSheetsBindingRepository.findOne({ id });
        if (!binding) {
            throw new NotFoundError('Интеграция не найдена');
        }
        switch (binding.status) {
            case 'error':
            case 'active':
                binding.status = 'inactive';
                break;
            case 'inactive':
                binding.status = 'active';
                break;
        }
        await this.googleSheetsBindingRepository.update(binding);
    }
    /**
     * Delete a binding by id
     *
     * @param id Binding id
     */
    async deleteBinding(id) {
        await this.googleSheetsBindingRepository.delete(id);
    }
}
