import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { ForgotPasswordDTO } from './DTO/ForgotPasswordDTO'
import { ResendVerificationDTO } from './DTO/ResendVerificationDTO'
import { VerificationDTO } from './DTO/VerificationDTO'
import { LoginDTO } from './DTO/LoginDTO'
import { RegisterDTO } from './DTO/RegisterDTO'
import { EmailChangeVerificationDTO } from './DTO/EmailChangeVerificationDTO'
import { LoginScheme } from './Schemes/LoginScheme'
import { RegistrationScheme } from './Schemes/RegisterScheme'
import { VerificationScheme } from './Schemes/VerificationScheme'
import { ResendVerificationScheme } from './Schemes/ResendVerificationScheme'
import { ForgotPasswordScheme } from './Schemes/ForgotPasswordScheme'
import { EmailChangeVerificationScheme } from '@modules/Users/Schemes/EmailChangeVerificationScheme'

@ErrorConverter()
export class AuthValidator extends Validator {
  public parseRegister(data: unknown): RegisterDTO {
    return this.parse<RegisterDTO>(data, RegistrationScheme)
  }

  public parseLogin(user: unknown): LoginDTO {
    return this.parse<LoginDTO>(user, LoginScheme)
  }

  public parseVerification(data: unknown): VerificationDTO {
    return this.parse<VerificationDTO>(data, VerificationScheme)
  }

  public parseResendVerification(data: unknown): ResendVerificationDTO {
    return this.parse<ResendVerificationDTO>(data, ResendVerificationScheme)
  }

  public validateForgotPassword(data: unknown): ForgotPasswordDTO {
    return this.parse<ForgotPasswordDTO>(data, ForgotPasswordScheme)
  }

  public parseEmailChangeVerification(
    data: unknown
  ): EmailChangeVerificationDTO {
    return this.parse<EmailChangeVerificationDTO>(
      data,
      EmailChangeVerificationScheme
    )
  }
}
