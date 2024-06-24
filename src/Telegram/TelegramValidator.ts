import { Validator } from '@modules/Core/Request/Validator'
import { BindingData } from './DTO/BindingData'
import { z } from 'zod'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'

@ErrorConverter()
export class TelegramValidator extends Validator {
  public bindingScheme = z.object({
    telegramUsername: z
      .string()
      .nonempty('Поле "telegramUsername" не должно быть пустым'),
  })

  public parseBindingData(data: unknown): BindingData {
    return this.parse<BindingData>(data, this.bindingScheme)
  }
}
