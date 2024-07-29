import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { z } from 'zod'
import { GoogleDocsBindingDTO } from './DTO/GoogleDocsBindingDTO'

@ErrorConverter()
export class GoogleDocsValidator extends Validator {
  public googleDocsBindindScheme = z.object({
    name: z.string(),
    entityName: z.string(),
    entitySelector: z.object({
      prop: z.string(),
      value: z.string(),
    }),
    filePath: z.string(),
    googleCredentials: z.any(),
    googleOAuthToken: z.string(),
    status: z.enum(['active', 'inactive', 'error']),
    format: z.enum(['csv']),
    frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  })

  public parseGoogleDocsBinding(data: unknown): GoogleDocsBindingDTO {
    return this.parse<GoogleDocsBindingDTO>(data, this.googleDocsBindindScheme)
  }
}
