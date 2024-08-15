import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { WorkDTO } from './DTO/WorkDTO'
import { WorkScheme } from './Schemes/WorkScheme'

@ErrorConverter()
export class WorkValidator extends Validator {
  public parseCreation(data: unknown): WorkDTO {
    return this.parse<WorkDTO>(data, WorkScheme.omit({ id: true }))
  }

  public parseUpdate(data: unknown): WorkDTO {
    return this.parse<WorkDTO>(data, WorkScheme)
  }
}
