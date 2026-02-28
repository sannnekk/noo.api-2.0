import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { UserSettings } from './Data/UserSettings'
import { UserSettingsScheme } from './Scheme/UserSettingsScheme'

@ErrorConverter()
export class UserSettingsValidator extends Validator {
  public parseSettings(data: unknown): UserSettings {
    return this.parse(data, UserSettingsScheme)
  }
}
