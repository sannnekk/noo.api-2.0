import { SessionRepository } from '../Data/SessionRepository'
import { Context } from '@modules/Core/Request/Context'
import { Session } from '../Data/Session'
import { SessionModel } from '../Data/SessionModel'
import { InternalError } from '@modules/Core/Errors/InternalError'
import { User } from '@modules/Users/Data/User'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'

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

  public async getCurrentSession(context: Context): Promise<Session | null> {
    return this.sessionRepository.findOne({
      user: {
        id: context.credentials?.userId,
      },
      userAgent: context.info.userAgent,
    })
  }

  public async createSession(context: Context): Promise<Session> {
    const session = new SessionModel()

    if (!context.credentials?.userId) {
      throw new InternalError('User id is missing in the context.')
    }

    session.user = { id: context.credentials.userId } as User

    session.userAgent = context.info.userAgent
    session.isMobile = context.info.isMobile
    session.device = context.info.device || null
    session.os = context.info.os || null
    session.browser = context.info.browser || null
    session.ipAddress = context.info.ipAddress
    session.lastRequestAt = new Date()

    return this.sessionRepository.create(session)
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