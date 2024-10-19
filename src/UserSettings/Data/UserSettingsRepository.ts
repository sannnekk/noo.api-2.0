import { Repository } from '@modules/Core/Data/Repository'
import type { UserSettings } from './UserSettings'
import { UserSettingsModel } from './UserSettingsModel'

export class UserSettingsRepository extends Repository<UserSettings> {
  public constructor() {
    super(UserSettingsModel)
  }
}
