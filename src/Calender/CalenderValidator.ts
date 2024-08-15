import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { EventCreationOptions } from './DTO/EventCreationOptions'
import { CalenderEventScheme } from './Schemes/CalenderEventScheme'

@ErrorConverter()
export class CalenderValidator extends Validator {
  public parseEventCreation(event: unknown): EventCreationOptions {
    return this.parse<EventCreationOptions>(event, CalenderEventScheme)
  }
}
