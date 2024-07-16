import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { WorkDTO } from './DTO/WorkDTO'

@ErrorConverter()
export class WorkValidator extends Validator {
  public workTypeScheme = z.enum([
    'trial-work',
    'phrase',
    'mini-test',
    'test',
    'second-part',
  ])

  public taskTypeScheme = z.enum([
    'text',
    'one_choice',
    'multiple_choice',
    'word',
  ])

  public checkingStrategyScheme = z.enum(['type1', 'type2', 'type3', 'type4'])

  public taskScheme = z.object({
    id: z.string().optional(),
    slug: z.string().optional().nullable(),
    content: DeltaScheme,
    order: z.number(),
    highestScore: z.number().int().positive(),
    type: this.taskTypeScheme,
    rightAnswer: z.string().nullable().optional(),
    solveHint: DeltaScheme.nullable().optional(),
    checkHint: DeltaScheme.nullable().optional(),
    checkingStrategy: this.checkingStrategyScheme.nullable().optional(),
  })

  public workScheme = z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    name: z
      .string()
      .min(1, 'Нет названия работы')
      .max(
        100,
        'Название работы слишком длинное, максимум 100 символов разрешено'
      ),
    type: this.workTypeScheme,
    description: z.string().optional(),
    tasks: z.array(this.taskScheme),
  })

  public parseCreation(data: unknown): WorkDTO {
    return this.parse<WorkDTO>(data, this.workScheme.omit({ id: true }))
  }

  public parseUpdate(data: unknown): WorkDTO {
    return this.parse<WorkDTO>(data, this.workScheme)
  }
}
