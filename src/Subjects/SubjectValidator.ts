import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { z } from 'zod'
import { Subject } from './Data/Subject'

@ErrorConverter()
export class SubjectValidator extends Validator {
  public readonly subjectScheme = z.object({
    id: z.string().ulid().optional(),
    name: z
      .string()
      .min(1, { message: 'Название предмета слишком короткое' })
      .max(255, {
        message: 'Название предмета не может быть длиннее 255 символов',
      }),
    color: z.string(),
  })

  public parseSubject(data: unknown): Subject {
    return this.parse<Subject>(data, this.subjectScheme)
  }
}
