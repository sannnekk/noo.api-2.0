import { BaseModel } from '@modules/Core/Data/Model'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { Service } from '@modules/Core/Services/Service'
import { User } from '@modules/Users/Data/User'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { BindingData } from '../DTO/BindingData'
import { InvalidTelegramHashError } from '../Errors/InvalidTelegramHashError'

export class TelegramService extends Service<BaseModel> {
  private readonly userRepository: UserRepository

  constructor() {
    super()

    this.userRepository = new UserRepository()
  }

  public async bindTelegram(
    userId: User['id'],
    bindingData: BindingData
  ): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId })

    if (!user) {
      throw new NotFoundError('Пользователь не найден')
    }

    if (!this.validateTelegramHash(bindingData.hash)) {
      throw new InvalidTelegramHashError()
    }

    user.telegramUsername = bindingData.telegramUsername
    user.telegramId = bindingData.telegramId

    await this.userRepository.update(user)
  }

  public async unbindTelegram(userId: User['id']): Promise<void> {
    const user = await this.userRepository.findOne({ id: userId })

    if (!user) {
      throw new NotFoundError('Пользователь не найден')
    }

    user.telegramId = null as any
    user.telegramUsername = null as any

    await this.userRepository.update(user)
  }

  private validateTelegramHash(hash: string): boolean {
    // TODO: Implement hash validation

    return hash.length > 0
  }
}
