import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'

@ErrorConverter()
export class GoogleDocsValidator extends Validator {}
