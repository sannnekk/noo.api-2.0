import { Repository } from '@modules/Core/Data/Repository'
import { Session } from './Session'
import { SessionModel } from './SessionModel'
import { SessionOptions } from '../SessionsOptions'
import { User } from '@modules/Users/Data/User'

export class SessionRepository extends Repository<Session> {
  constructor() {
    super(SessionModel)
  }

  public async countOnlineUsers(): Promise<number> {
    return this.queryBuilder()
      .distinctOn(['userId'])
      .where('last_request_at >= :datetime', {
        datetime: new Date(
          Date.now() - SessionOptions.onlineThreshold
        ).toISOString(),
      })
      .getCount()
  }

  public async findLast(userId: User['id']): Promise<Session | null> {
    return this.queryBuilder()
      .where('userId = :userId', { userId })
      .orderBy('last_request_at', 'DESC')
      .getOne()
  }
}
