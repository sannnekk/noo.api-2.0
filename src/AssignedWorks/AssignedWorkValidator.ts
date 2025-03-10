import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Validator } from '@modules/Core/Request/Validator'
import { RemakeOptions } from './DTO/RemakeOptions'
import { CreateOptions } from './DTO/CreateOptions'
import { SolveOptions } from './DTO/SolveOptions'
import { SaveOptions } from './DTO/SaveOptions'
import { CheckOptions } from './DTO/CheckOptions'
import { AssignedWorkRemakeOptionsScheme } from './Schemes/AssignedWorkRemakeOptionsScheme'
import { AssignedWorkCreateOptionsScheme } from './Schemes/AssignedWorkCreateOptionsScheme'
import { AssignedWorkSolveOptionsScheme } from './Schemes/AssignedWorkSolveOptionsScheme'
import { AssignedWorkCheckOptionsScheme } from './Schemes/AssignedWorkCheckOptionsScheme'
import { AssignedWorkSaveOptionsScheme } from './Schemes/AssignedWorkSaveOptionsScheme'
import { AssignedWorkAnswer } from './Data/Relations/AssignedWorkAnswer'
import { AssignedWorkAnswerScheme } from './Schemes/AssignedWorkAnswerScheme'
import { AssignedWorkComment } from './Data/Relations/AssignedWorkComment'
import { AssignedWorkCommentScheme } from './Schemes/AssignedWorkCommentScheme'
import { z } from 'zod'
import { AssignedWork } from './Data/AssignedWork'
import { DeltaScheme } from '@modules/Core/Schemas/DeltaScheme'

@ErrorConverter()
export class AssignedWorkValidator extends Validator {
  public parseRemake(body: unknown): RemakeOptions {
    return this.parse<RemakeOptions>(body, AssignedWorkRemakeOptionsScheme)
  }

  public parseCreation(data: unknown): CreateOptions {
    return this.parse<CreateOptions>(data, AssignedWorkCreateOptionsScheme)
  }

  public parseSolve(data: unknown): SolveOptions {
    return this.parse<SolveOptions>(data, AssignedWorkSolveOptionsScheme)
  }

  public parseCheck(data: unknown): CheckOptions {
    return this.parse<CheckOptions>(data, AssignedWorkCheckOptionsScheme)
  }

  public parseSave(data: unknown): SaveOptions {
    return this.parse<SaveOptions>(data, AssignedWorkSaveOptionsScheme)
  }

  public parseAnswer(data: unknown): AssignedWorkAnswer {
    return this.parse<AssignedWorkAnswer>(data, AssignedWorkAnswerScheme)
  }

  public parseComment(data: unknown): AssignedWorkComment {
    return this.parse<AssignedWorkComment>(data, AssignedWorkCommentScheme)
  }

  public parseWorkComments(data: unknown): {
    studentComment: AssignedWork['studentComment']
    mentorComment: AssignedWork['mentorComment']
  } {
    return this.parse<{
      studentComment: AssignedWork['studentComment']
      mentorComment: AssignedWork['mentorComment']
    }>(
      data,
      z.object({
        studentComment: DeltaScheme.nullable().optional(),
        mentorComment: DeltaScheme.nullable().optional(),
      })
    )
  }

  public parseBulkFavouriteTasksRemove(data: unknown): { ids: string[] } {
    return this.parse<{ ids: string[] }>(
      data,
      z.object({ ids: z.array(z.string().ulid()) })
    )
  }
}
