import { Repository } from '@modules/Core/Data/Repository'
import { GoogleSheetsBinding } from './GoogleSheetsBinding'
import { GoogleSheetsBindingModel } from './GoogleSheetsBindingModel'

export class GoogleSheetsBindingRepository extends Repository<GoogleSheetsBinding> {
  public constructor() {
    super(GoogleSheetsBindingModel)
  }
}
