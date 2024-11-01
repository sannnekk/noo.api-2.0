import { SessionRepository } from '../Data/SessionRepository'
import { Context } from '@modules/Core/Request/Context'
import { Session } from '../Data/Session'
import { SessionModel } from '../Data/SessionModel'
import { User } from '@modules/Users/Data/User'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import date from '@modules/Core/Utils/date'
import { SessionOptions } from '../SessionsOptions'
import { FindOptionsWhere } from 'typeorm'

export type OnlineStatus = {
  isOnline: boolean
  lastRequestAt: Date | null
  isLastRequestMobile: boolean
}

export class SessionService {
  private readonly sessionRepository: SessionRepository

  public constructor() {
    this.sessionRepository = new SessionRepository()
  }

  public async getSessionsForUser(
    context: Context
  ): Promise<(Session & { isCurrent: boolean })[]> {
    const sessions = await this.sessionRepository.findAll({
      user: {
        id: context.credentials!.userId,
      } as User,
    })

    const currentSession = await this.getCurrentSession(context)

    return sessions.map((session) => {
      return {
        ...session,
        isCurrent: session.id === currentSession?.id,
      }
    })
  }

  public async deleteSessionsForUser(userId: User['id']): Promise<void> {
    const { entities: sessions } = await this.sessionRepository.find({
      user: { id: userId } as User,
    })

    await Promise.all(
      sessions.map((session) => this.sessionRepository.delete(session.id))
    )
  }

  public async getCurrentSession(
    context: Context,
    userId?: User['id']
  ): Promise<Session | null> {
    if (userId) {
      return this.sessionRepository.findOne({
        user: { id: userId } as User,
        userAgent: context.info.userAgent,
      })
    }

    return this.sessionRepository.findOne({
      id: context.credentials!.sessionId,
      userAgent: context.info.userAgent,
    })
  }

  public async createSession(
    context: Context,
    userId: User['id']
  ): Promise<Session> {
    const session = new SessionModel()

    session.user = { id: userId } as User

    session.userAgent = context.info.userAgent
    session.isMobile = context.info.isMobile
    session.device = context.info.device || null
    session.os = context.info.os || null
    session.browser = context.info.browser || null
    session.ipAddress = context.info.ipAddress
    session.lastRequestAt = new Date()

    return this.sessionRepository.create(session)
  }

  public async getOnlineUsersCount(
    condition?: FindOptionsWhere<Session>
  ): Promise<number> {
    return this.sessionRepository.countOnlineUsers(condition)
  }

  public async getActiveUsersCount(
    condition?: FindOptionsWhere<Session>
  ): Promise<number> {
    return this.sessionRepository.countActiveUsers(condition)
  }

  public async getOnlineStatus(userId: User['id']): Promise<OnlineStatus> {
    // find last session for user
    const session = await this.sessionRepository.findLast(userId)

    if (!session) {
      return {
        isOnline: false,
        lastRequestAt: null,
        isLastRequestMobile: false,
      }
    }

    return {
      isOnline: date.isInLast(
        session.lastRequestAt,
        SessionOptions.onlineThreshold
      ),
      lastRequestAt: session.lastRequestAt,
      isLastRequestMobile: session.isMobile,
    }
  }

  public getOnlineStatusForUser(user: User): User & OnlineStatus {
    const session = user.sessions
      ?.sort((a, b) => {
        return date.compare(a.lastRequestAt, b.lastRequestAt)
      })
      .at(0)

    if (!session) {
      return {
        ...user,
        isOnline: false,
        lastRequestAt: null,
        isLastRequestMobile: false,
      }
    }

    return {
      ...user,
      isOnline: date.isInLast(
        session.lastRequestAt,
        SessionOptions.onlineThreshold
      ),
      lastRequestAt: session.lastRequestAt,
      isLastRequestMobile: session.isMobile,
    }
  }

  public async updateSession(
    session: Session,
    context: Context
  ): Promise<void> {
    session.userAgent = context.info.userAgent
    session.isMobile = context.info.isMobile
    session.device = context.info.device || null
    session.os = context.info.os || null
    session.browser = context.info.browser || null
    session.ipAddress = context.info.ipAddress
    session.lastRequestAt = new Date()

    await this.sessionRepository.update(session)
  }

  public async deleteSession(
    sessionId: string,
    userId: User['id']
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({ id: sessionId }, [
      'user',
    ])

    if (!session) {
      return
    }

    if (session.user!.id !== userId) {
      throw new UnauthorizedError('Вы не можете удалять чужие сессии.')
    }

    await this.sessionRepository.delete(session.id)
  }

  public async deleteCurrentSession(context: Context): Promise<void> {
    const session = await this.getCurrentSession(context)

    if (session) {
      await this.sessionRepository.delete(session.id)
    }
  }
}
