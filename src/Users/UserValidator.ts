import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { UpdateUserDTO } from './DTO/UpdateUserDTO'
import { UpdateTelegramDTO } from './DTO/UpdateTelegramDTO'
import { UpdateEmailDTO } from './DTO/UpdateEmailDTO'
import { PasswordUpdateDTO } from './DTO/PasswordUpdateDTO'
import { User } from './Data/User'
import { UserRoleScheme } from '@modules/Core/Schemes/UserRoleScheme'
import { UpdatePasswordScheme } from './Schemes/UpdatePasswordScheme'
import { TelegramUpdateScheme } from './Schemes/TelegramUpdateScheme'
import { EmailUpdateScheme } from './Schemes/EmailUpdateScheme'
import { UserUpdateScheme } from './Schemes/UserUpdateScheme'

@ErrorConverter()
export class UserValidator extends Validator {
  public parseRole(role: unknown): User['role'] {
    return this.parse<User['role']>(role, UserRoleScheme)
  }

  public parseUpdate(user: unknown): UpdateUserDTO {
    return this.parse<UpdateUserDTO>(user, UserUpdateScheme)
  }

  public parseUpdatePassword(data: unknown): PasswordUpdateDTO {
    return this.parse<PasswordUpdateDTO>(data, UpdatePasswordScheme)
  }

  public parseTelegramUpdate(data: unknown): UpdateTelegramDTO {
    return this.parse<UpdateTelegramDTO>(data, TelegramUpdateScheme)
  }

  public parseEmailUpdate(data: unknown): UpdateEmailDTO {
    return this.parse<UpdateEmailDTO>(data, EmailUpdateScheme)
  }
}
