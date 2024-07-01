import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'
import { RemakeOptions } from './DTO/RemakeOptions'
import { CreateOptions } from './DTO/CreateOptions'
import { SolveOptions } from './DTO/SolveOptions'
import { SaveOptions } from './DTO/SaveOptions'
import { CheckOptions } from './DTO/CheckOptions'

@ErrorConverter()
export class AssignedWorkValidator extends Validator {
  public readonly answerScheme = z.object({
    id: z.string().optional(),
    slug: z.string().nullable().optional(),
    content: DeltaScheme.nullable().optional(),
    word: z.string().nullable().optional(),
    taskId: z.string().ulid(),
  })

  public readonly commentScheme = z.object({
    id: z.string().optional(),
    slug: z.string().nullable().optional(),
    content: DeltaScheme.nullable().optional(),
    score: z.number(),
    taskId: z.string().ulid(),
  })

  public readonly remakeOptionsScheme = z.object({
    onlyFalse: z.boolean().optional(),
  })

  public readonly createOptionsScheme = z.object({
    studentId: z.string().ulid(),
    workId: z.string().ulid(),
  })

  public readonly solveOptionsScheme = z.object({
    answers: z.array(this.answerScheme),
  })

  public readonly checkOptionsScheme = z.object({
    answers: z.array(this.answerScheme),
    comments: z.array(this.commentScheme),
  })

  public readonly saveOptionsScheme = z.object({
    answers: z.array(this.answerScheme),
    comments: z.array(this.commentScheme).optional(),
  })

  public parseRemake(body: unknown): RemakeOptions {
    return this.parse<RemakeOptions>(body, this.remakeOptionsScheme)
  }

  public parseCreation(data: unknown): CreateOptions {
    return this.parse<CreateOptions>(data, this.createOptionsScheme)
  }

  public parseSolve(data: unknown): SolveOptions {
    return this.parse<SolveOptions>(data, this.solveOptionsScheme)
  }

  public parseCheck(data: unknown): CheckOptions {
    return this.parse<CheckOptions>(data, this.checkOptionsScheme)
  }

  public parseSave(data: unknown): SaveOptions {
    return this.parse<SaveOptions>(data, this.saveOptionsScheme)
  }
}
