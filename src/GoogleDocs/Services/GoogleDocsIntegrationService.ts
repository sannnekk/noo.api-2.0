import { Pagination } from '@modules/Core/Data/Pagination'
import { GoogleDocsBinding } from '../Data/GoogleDocsBinding'
import { GoogleDocsBindingRepository } from '../Data/GoogleDocsBindingRepository'
import { GoogleDocsBindingDTO } from '../DTO/GoogleDocsBindingDTO'
import { GoogleDocsBindingModel } from '../Data/GoogleDocsBindingModel'
import { Service } from '@modules/Core/Services/Service'
import { GoogleAuthService } from './Google/GoogleAuthService'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { BindingSyncService } from './BindingSyncService'

export class GoogleDocsIntegrationService {
  private readonly googleDocsBindingRepository: GoogleDocsBindingRepository

  private readonly googleAuthService: GoogleAuthService

  private readonly bindingSyncService: BindingSyncService

  public constructor() {
    this.googleDocsBindingRepository = new GoogleDocsBindingRepository()
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
    pagination = new Pagination().assign(pagination)
    pagination.entriesToSearch = GoogleDocsBindingModel.entriesToSearch()

    return this.googleDocsBindingRepository.search(undefined, pagination, [])
  }

  /**
   * Create a binding
   *
   * @param data
   */
  public async createBinding(data: GoogleDocsBindingDTO) {
    const { refresh_token: refreshToken, id_token: idToken } =
      await this.googleAuthService.getTokens(
        data.googleOAuthToken,
        data.googleRefreshToken
      )

    const authCredentials =
      await this.googleAuthService.getAuthDataFromIdToken(idToken)

    const binding = new GoogleDocsBindingModel({
      ...data,
      status: 'active',
      googleRefreshToken: refreshToken,
      googleOAuthToken: refreshToken ? null : data.googleOAuthToken,
      googleCredentials: authCredentials || null,
    })

    await this.googleDocsBindingRepository.create(binding)
  }

  /**
   * Trigger a binding by id
   *
   * @param id binding id
   */
  public async triggerBinding(id: GoogleDocsBinding['id']) {
    const binding = await this.googleDocsBindingRepository.findOne({ id })

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
      await this.googleDocsBindingRepository.update(binding)
    }
  }

  /**
   * Switch on/off a binding by id
   *
   * @param id binding id
   */
  public async switchOnOffBinding(id: GoogleDocsBinding['id']) {
    const binding = await this.googleDocsBindingRepository.findOne({ id })

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

    await this.googleDocsBindingRepository.update(binding)
  }

  /**
   * Delete a binding by id
   *
   * @param id Binding id
   */
  public async deleteBinding(id: GoogleDocsBinding['id']) {
    await this.googleDocsBindingRepository.delete(id)
  }
}
