import { Repository } from '@modules/Core/Data/Repository'
import { Session } from './Session'
import { SessionModel } from './SessionModel'
import { SessionOptions } from '../SessionsOptions'

export class SessionRepository extends Repository<Session> {
  constructor() {
    super(SessionModel)
  }

  public async countOnlineUsers(): Promise<number> {
    return this.queryBuilder()
      .distinctOn(['userId'])
      .where('last_request_at >= :datetime', {
        datetime: SessionOptions.countAsOfflineAfter,
      })
      .getCount()
  }
}
