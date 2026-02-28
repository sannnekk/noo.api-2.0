import { Repository } from '@modules/Core/Data/Repository'
import { SessionModel } from './SessionModel'
import { SessionOptions } from '../SessionsOptions'
import type { Session } from './Session'
import type { User } from '@modules/Users/Data/User'
import type { FindOptionsWhere } from 'typeorm'
import Dates from '@modules/Core/Utils/date'

export class SessionRepository extends Repository<Session> {
  constructor() {
    super(SessionModel)
  }

  public async countOnlineUsers(
    condition?: FindOptionsWhere<Session>
  ): Promise<number> {
    const query = this.queryBuilder()
      .select('COUNT(userId)', 'count')
      .where('last_request_at >= :datetime', {
        datetime: Dates.format(
          new Date(Date.now() - SessionOptions.onlineThreshold),
          'YYYY-MM-DD HH:mm:ss'
        ),
      })

    if (condition) {
      query.setFindOptions({
        where: condition,
      })
    }

    const count = await query.getRawOne()

    return parseInt(count.count, 10)
  }

  public async countActiveUsers(
    condition?: FindOptionsWhere<Session>
  ): Promise<number> {
    const query = this.queryBuilder()
      .select('COUNT(DISTINCT userId)', 'count')
      .where('last_request_at >= :datetime', {
        datetime: Dates.format(
          new Date(Date.now() - SessionOptions.activeThreshold),
          'YYYY-MM-DD HH:mm:ss'
        ),
      })

    if (condition) {
      query.setFindOptions({
        where: condition,
      })
    }

    const count = await query.getRawOne()

    return parseInt(count.count, 10)
  }

  public async countAppUsers() {
    return this.queryBuilder()
      .select('COUNT(DISTINCT userId)', 'count')
      .where('is_app = :isApp', { isApp: true })
      .getRawOne()
      .then((result) => parseInt(result.count, 10))
  }

  public async findLast(userId: User['id']): Promise<Session | null> {
    return this.queryBuilder()
      .where('userId = :userId', { userId })
      .orderBy('last_request_at', 'DESC')
      .getOne()
  }
}
