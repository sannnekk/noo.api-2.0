import { Validator } from '@modules/Core/Request/Validator'
import { ErrorConverter } from '@modules/Core/Request/ValidatorDecorator'
import { NotoficationCreationDTO } from './DTO/NotoficationCreationDTO'
import { CreateNotificationScheme } from './schemes/CreateNotificationScheme'

@ErrorConverter()
export class NotificationValidator extends Validator {
  public parseNotificationCreation(data: unknown): NotoficationCreationDTO {
    return this.parse<NotoficationCreationDTO>(data, CreateNotificationScheme)
  }
}
