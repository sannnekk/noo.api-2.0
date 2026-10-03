import { z } from 'zod'
import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import {
  PushSubscriptionScheme,
  PushUnsubscriptionScheme,
} from './schemes/PushSubscriptionScheme'

export type PushSubscriptionDTO = z.infer<typeof PushSubscriptionScheme>

export type PushUnsubscriptionDTO = z.infer<typeof PushUnsubscriptionScheme>

@ErrorConverter()
export class PushSubscriptionValidator extends Validator {
  public parseSubscription(data: unknown): PushSubscriptionDTO {
    return this.parse<PushSubscriptionDTO>(data, PushSubscriptionScheme)
  }

  public parseUnsubscription(data: unknown): PushUnsubscriptionDTO {
    return this.parse<PushUnsubscriptionDTO>(data, PushUnsubscriptionScheme)
  }
}
