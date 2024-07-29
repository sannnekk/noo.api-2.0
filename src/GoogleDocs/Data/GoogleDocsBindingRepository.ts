import { Repository } from '@modules/Core/Data/Repository'
import { GoogleDocsBinding } from './GoogleDocsBinding'
import { GoogleDocsBindingModel } from './GoogleDocsBindingModel'

export class GoogleDocsBindingRepository extends Repository<GoogleDocsBinding> {
  public constructor() {
    super(GoogleDocsBindingModel)
  }
}
