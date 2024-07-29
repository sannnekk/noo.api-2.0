import { Pagination } from '@modules/Core/Data/Pagination'
import { GoogleDocsBinding } from '../Data/GoogleDocsBinding'
import { GoogleDocsBindingRepository } from '../Data/GoogleDocsBindingRepository'
import { GoogleDocsBindingDTO } from '../DTO/GoogleDocsBindingDTO'
import { GoogleDocsBindingModel } from '../Data/GoogleDocsBindingModel'
import { Service } from '@modules/Core/Services/Service'

export class GoogleDocsIntegrationService extends Service<GoogleDocsBinding> {
  private readonly googleDocsBindingRepository: GoogleDocsBindingRepository

  public constructor() {
    super()

    this.googleDocsBindingRepository = new GoogleDocsBindingRepository()
  }

  public async getBindings(pagination: Pagination) {
    pagination = new Pagination().assign(pagination)
    pagination.entriesToSearch = GoogleDocsBindingModel.entriesToSearch()

    const bindings = await this.googleDocsBindingRepository.find(
      undefined,
      [],
      pagination
    )

    const meta = await this.getRequestMeta(
      this.googleDocsBindingRepository,
      undefined,
      pagination,
      []
    )

    return {
      bindings,
      meta,
    }
  }

  public async createBinding(data: GoogleDocsBindingDTO) {
    const binding = new GoogleDocsBindingModel({
      ...data,
      status: 'active',
    })

    await this.googleDocsBindingRepository.create(binding)
  }

  public async deleteBinding(id: GoogleDocsBinding['id']) {
    await this.googleDocsBindingRepository.delete(id)
  }
}
