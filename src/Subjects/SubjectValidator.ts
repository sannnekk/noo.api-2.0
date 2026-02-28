import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Subject } from './Data/Subject'
import { SubjectScheme } from './Schemes/SubjectScheme'

@ErrorConverter()
export class SubjectValidator extends Validator {
  public parseSubject(data: unknown): Subject {
    return this.parse<Subject>(data, SubjectScheme)
  }
}
