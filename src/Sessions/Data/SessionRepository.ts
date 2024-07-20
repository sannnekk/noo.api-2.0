import { Repository } from '@modules/Core/Data/Repository'
import { Session } from './Session'
import { SessionModel } from './SessionModel'

export class SessionRepository extends Repository<Session> {
  constructor() {
    super(SessionModel)
  }
}
