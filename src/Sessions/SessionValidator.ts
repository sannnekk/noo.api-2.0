import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'

@ErrorConverter()
export class SessionValidator extends Validator {}
