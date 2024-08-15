import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { GoogleSheetsBindingDTO } from './DTO/GoogleSheetsBindingDTO'
import { GoogleSheetsBindingScheme } from './Schemes/GoogleSheetsBindingScheme'
import { GoogleSheetsFrequencyScheme } from './Schemes/GoogleSheetsFrequencyScheme'

@ErrorConverter()
export class GoogleSheetsValidator extends Validator {
  public parseGoogleDocsBinding(data: unknown): GoogleSheetsBindingDTO {
    return this.parse<GoogleSheetsBindingDTO>(data, GoogleSheetsBindingScheme)
  }

  public parseFrequency(data: unknown): string {
    return this.parse<string>(data, GoogleSheetsFrequencyScheme)
  }
}
