import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { z } from 'zod'
import { GoogleDocsBindingDTO } from './DTO/GoogleDocsBindingDTO'

@ErrorConverter()
export class GoogleDocsValidator extends Validator {
  public frequencyScheme = z.enum(['hourly', 'daily', 'weekly', 'monthly'])

  public googleDocsBindindScheme = z.object({
    name: z.string(),
    entityName: z.string(),
    entitySelector: z.object({
      prop: z.string(),
      value: z.string(),
    }),
    //filePath: z.string(),
    googleOAuthToken: z.string(),
    googleCredentials: z.any(),
    status: z.enum(['active', 'inactive', 'error']),
    frequency: this.frequencyScheme,
  })

  public parseGoogleDocsBinding(data: unknown): GoogleDocsBindingDTO {
    return this.parse<GoogleDocsBindingDTO>(data, this.googleDocsBindindScheme)
  }

  public parseFrequency(data: unknown): string {
    return this.parse<string>(data, this.frequencyScheme)
  }
}
