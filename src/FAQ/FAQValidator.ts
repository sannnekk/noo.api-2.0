import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { UserValidator } from '@modules/Users/UserValidator'
import { z } from 'zod'
import { FAQArticle } from './Data/FAQArticle'

@ErrorConverter()
export class FAQValidator extends Validator {
  public readonly userValidator: UserValidator = new UserValidator()

  public articleScheme = z.object({
    id: z.string().ulid().optional(),
    for: z.union([
      z.literal('all'),
      z.array(this.userValidator.userRoleScheme),
    ]),
    title: z.string().min(1, { message: 'Название не должно быть пустым' }),
    content: DeltaScheme,
  })

  public parseArticle(data: unknown): FAQArticle {
    return this.parse<FAQArticle>(data, this.articleScheme)
  }
}
