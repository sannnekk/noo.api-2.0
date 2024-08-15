import { z } from 'zod'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { UserRoles } from '@modules/Core/Security/roles'
import { LoginDTO } from './DTO/LoginDTO'
import { ForgotPasswordDTO } from './DTO/ForgotPasswordDTO'
import { ResendVerificationDTO } from './DTO/ResendVerificationDTO'
import { VerificationDTO } from './DTO/VerificationDTO'
import { RegisterDTO } from './DTO/RegisterDTO'
import { UpdateUserDTO } from './DTO/UpdateUserDTO'
import { UpdateTelegramDTO } from './DTO/UpdateTelegramDTO'
import { EmailChangeVerificationDTO } from './DTO/EmailChangeVerificationDTO'
import { UpdateEmailDTO } from './DTO/UpdateEmailDTO'
import { MediaScheme } from '@modules/Media/MediaScheme'

@ErrorConverter()
export class UserValidator extends Validator {
  public userRoleScheme = z.enum(
    Object.keys(UserRoles) as [string, ...string[]]
  )

  public passwordScheme = z
    .string()
    .min(8, {
      message: 'Пароль должен быть 8 символов или длиннее',
    })
    .max(64, {
      message: 'Пароль должен быть короче 64 символов',
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
      message:
        'Пароль должен содержать хотя бы одну цифру, одну заглавную и одну строчную букву',
    })

  public usernameScheme = z
    .string()
    .min(3, {
      message: 'Никнейм должен быть длиннее двух символов',
    })
    .max(32, {
      message: 'Никнейм должен быть короче 32 символов',
    })
    .regex(/^[A-Za-z0-9_-]+$/i)

  public emailScheme = z.string().email({ message: 'Неверный формат почты' })

  public userAvatarScheme = z.object({
    id: z.string().ulid().optional().nullable(),
    media: MediaScheme.nullable().optional(),
    avatarType: z.enum(['telegram', 'custom']),
    telegramAvatarUrl: z.string().optional().nullable(),
  })

  public registerScheme = z.object({
    name: z
      .string()
      .min(3, {
        message: 'ФИО должен быть длиннее двух символов',
      })
      .max(255, {
        message: 'ФИО должен быть короче 32 символов',
      }),
    username: this.usernameScheme,
    email: this.emailScheme,
    password: this.passwordScheme,
  })

  public updateScheme = z.object({
    id: z.string().ulid(),
    name: z.string().optional(),
    password: this.passwordScheme.optional(),
    avatar: this.userAvatarScheme.optional().nullable(),
    role: this.userRoleScheme.optional(),
    isBlocked: z.boolean().optional(),
    forbidden: z.number().optional(),
  })

  public telegramUpdate = z.object({
    telegramId: z.string().nullable().optional(),
    telegramUsername: z.string().nullable().optional(),
    telegramAvatarUrl: z.string().nullable().optional(),
  })

  public loginScheme = z.object({
    usernameOrEmail: this.usernameScheme.or(this.emailScheme),
    password: z.string().min(5).max(128),
  })

  public verificationScheme = z.object({
    token: z
      .string()
      .min(8, { message: 'Неверный токен' })
      .max(255, { message: 'Неверный токен' }),
    username: this.usernameScheme,
  })

  public emailUpdateScheme = z.object({ email: this.emailScheme })

  public emailChangeVerificationScheme = z.object({
    token: z
      .string()
      .min(8, { message: 'Неверный токен' })
      .max(255, { message: 'Неверный токен' }),
    username: this.usernameScheme,
  })

  public resendVerificationScheme = z.object({
    email: this.emailScheme,
  })

  public forgotPasswordScheme = z.object({
    email: this.emailScheme,
  })

  public parseRegister(data: unknown): RegisterDTO {
    return this.parse<RegisterDTO>(data, this.registerScheme)
  }

  public parseLogin(user: unknown): LoginDTO {
    return this.parse<LoginDTO>(user, this.loginScheme)
  }

  public parseVerification(data: unknown): VerificationDTO {
    return this.parse<VerificationDTO>(data, this.verificationScheme)
  }

  public parseEmailChangeVerification(
    data: unknown
  ): EmailChangeVerificationDTO {
    return this.parse<EmailChangeVerificationDTO>(
      data,
      this.emailChangeVerificationScheme
    )
  }

  public parseResendVerification(data: unknown): ResendVerificationDTO {
    return this.parse<ResendVerificationDTO>(
      data,
      this.resendVerificationScheme
    )
  }

  public parseUpdate(user: unknown): UpdateUserDTO {
    return this.parse<UpdateUserDTO>(user, this.updateScheme)
  }

  public parseTelegramUpdate(data: unknown): UpdateTelegramDTO {
    return this.parse<UpdateTelegramDTO>(data, this.telegramUpdate)
  }

  public parseEmailUpdate(data: unknown): UpdateEmailDTO {
    return this.parse<UpdateEmailDTO>(data, this.emailUpdateScheme)
  }

  public validateForgotPassword(data: unknown): ForgotPasswordDTO {
    return this.parse<ForgotPasswordDTO>(data, this.forgotPasswordScheme)
  }
}
