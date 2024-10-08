import { Pagination } from '@modules/Core/Data/Pagination'
import { GoogleSheetsBinding } from '../Data/GoogleSheetsBinding'
import { GoogleSheetsBindingRepository } from '../Data/GoogleSheetsBindingRepository'
import { GoogleSheetsBindingDTO } from '../DTO/GoogleSheetsBindingDTO'
import { GoogleSheetsBindingModel } from '../Data/GoogleSheetsBindingModel'
import { GoogleAuthService } from './Google/GoogleAuthService'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { BindingSyncService } from './BindingSyncService'

export class GoogleSheetsIntegrationService {
  private readonly googleSheetsBindingRepository: GoogleSheetsBindingRepository

  private readonly googleAuthService: GoogleAuthService

  private readonly bindingSyncService: BindingSyncService

  public constructor() {
    this.googleSheetsBindingRepository = new GoogleSheetsBindingRepository()
    this.googleAuthService = new GoogleAuthService()
    this.bindingSyncService = new BindingSyncService()
  }

  /**
   * Get google docs bindings with pagination
   *
   * @param pagination
   * @returns
   */
  public async getBindings(pagination: Pagination) {
    return this.googleSheetsBindingRepository.search(undefined, pagination)
  }

  /**
   * Create a binding
   *
   * @param data
   */
  public async createBinding(data: GoogleSheetsBindingDTO) {
    const { refresh_token: refreshToken, id_token: idToken } =
      await this.googleAuthService.getTokens(
        data.googleOAuthToken,
        data.googleRefreshToken
      )

    const authCredentials =
      await this.googleAuthService.getAuthDataFromIdToken(idToken)

    const binding = new GoogleSheetsBindingModel({
      ...data,
      status: 'active',
      googleRefreshToken: refreshToken,
      googleOAuthToken: refreshToken ? null : data.googleOAuthToken,
      googleCredentials: authCredentials || null,
    })

    await this.googleSheetsBindingRepository.create(binding)
  }

  /**
   * Trigger a binding by id
   *
   * @param id binding id
   */
  public async triggerBinding(id: GoogleSheetsBinding['id']) {
    const binding = await this.googleSheetsBindingRepository.findOne({ id })

    if (!binding) {
      throw new NotFoundError('Интеграция не найдена')
    }

    binding.lastRunAt = new Date()

    try {
      const filePath = await this.bindingSyncService.sync(binding)

      binding.filePath = filePath
      binding.lastErrorText = null
      binding.googleOAuthToken = null
      binding.status = 'active'
    } catch (error: any) {
      binding.status = 'error'
      binding.lastErrorText = error.message
    } finally {
      await this.googleSheetsBindingRepository.update(binding)
    }
  }

  /**
   * Switch on/off a binding by id
   *
   * @param id binding id
   */
  public async switchOnOffBinding(id: GoogleSheetsBinding['id']) {
    const binding = await this.googleSheetsBindingRepository.findOne({ id })

    if (!binding) {
      throw new NotFoundError('Интеграция не найдена')
    }

    switch (binding.status) {
      case 'error':
      case 'active':
        binding.status = 'inactive'
        break
      case 'inactive':
        binding.status = 'active'
        break
    }

    await this.googleSheetsBindingRepository.update(binding)
  }

  /**
   * Delete a binding by id
   *
   * @param id Binding id
   */
  public async deleteBinding(id: GoogleSheetsBinding['id']) {
    await this.googleSheetsBindingRepository.delete(id)
  }
}
