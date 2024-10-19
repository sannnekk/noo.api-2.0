import { User } from '@modules/Users/Data/User'
import type { UserSettings } from '../Data/UserSettings'
import { UserSettingsRepository } from '../Data/UserSettingsRepository'

export class UserSettingsService {
  private readonly userSettingsRepository: UserSettingsRepository

  public constructor() {
    this.userSettingsRepository = new UserSettingsRepository()
  }

  public async getSettings(userId: string): Promise<UserSettings | null> {
    return this.userSettingsRepository.findOne({ user: { id: userId } })
  }

  public async updateSettings(
    userId: string,
    settings: UserSettings
  ): Promise<UserSettings> {
    const userSettings = await this.userSettingsRepository.findOne({
      user: { id: userId },
    })

    if (userSettings) {
      return this.userSettingsRepository.update({
        ...settings,
        user: {
          id: userId,
        } as User,
        id: userSettings.id,
      })
    }

    return this.userSettingsRepository.create({
      ...settings,
      user: {
        id: userId,
      } as User,
    })
  }
}
