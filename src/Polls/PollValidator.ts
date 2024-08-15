import { Validator } from '@modules/Core/Request/Validator'
import { z } from 'zod'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { Poll } from './Data/Poll'
import { PollAnswer } from './Data/Relations/PollAnswer'
import { PollAnswerScheme } from './Schemes/PollAnswerScheme'
import { PollScheme } from './Schemes/PollScheme'
import { PollAnswerEditScheme } from './Schemes/PollAnswerEditScheme'

@ErrorConverter()
export class PollValidator extends Validator {
  public parsePoll(data: unknown): Poll {
    return this.parse<Poll>(data, PollScheme)
  }

  public parsePollAnswers(data: unknown): PollAnswer[] {
    return this.parse<PollAnswer[]>(data, z.array(PollAnswerScheme))
  }

  public parsePollAnswer(data: unknown): PollAnswer {
    return this.parse<PollAnswer>(data, PollAnswerEditScheme)
  }

  public parseIdOrTelegramUsername(data: unknown): string {
    return this.parse<string>(data, this.idScheme.or(z.string().min(1)))
  }
}
