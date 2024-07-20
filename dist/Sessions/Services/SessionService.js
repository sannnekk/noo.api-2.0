import { SessionRepository } from '../Data/SessionRepository.js';
import { SessionModel } from '../Data/SessionModel.js';
import { InternalError } from '../../Core/Errors/InternalError.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
export class SessionService {
    sessionRepository;
    constructor() {
        this.sessionRepository = new SessionRepository();
    }
    async getSessionsForUser(context) {
        const sessions = await this.sessionRepository.findAll({
            user: {
                id: context.credentials.userId,
            },
        });
        const currentSession = await this.getCurrentSession(context);
        return sessions.map((session) => {
            return {
                ...session,
                isCurrent: session.id === currentSession?.id,
            };
        });
    }
    async getCurrentSession(context) {
        return this.sessionRepository.findOne({
            user: {
                id: context.credentials?.userId,
            },
            userAgent: context.info.userAgent,
        });
    }
    async createSession(context) {
        const session = new SessionModel();
        if (!context.credentials?.userId) {
            throw new InternalError('User id is missing in the context.');
        }
        session.user = { id: context.credentials.userId };
        session.userAgent = context.info.userAgent;
        session.isMobile = context.info.isMobile;
        session.device = context.info.device || null;
        session.os = context.info.os || null;
        session.browser = context.info.browser || null;
        session.ipAddress = context.info.ipAddress;
        session.lastRequestAt = new Date();
        return this.sessionRepository.create(session);
    }
    async updateSession(session, context) {
        session.userAgent = context.info.userAgent;
        session.isMobile = context.info.isMobile;
        session.device = context.info.device || null;
        session.os = context.info.os || null;
        session.browser = context.info.browser || null;
        session.ipAddress = context.info.ipAddress;
        session.lastRequestAt = new Date();
        await this.sessionRepository.update(session);
    }
    async deleteSession(sessionId, userId) {
        const session = await this.sessionRepository.findOne({ id: sessionId }, [
            'user',
        ]);
        if (!session) {
            return;
        }
        if (session.user.id !== userId) {
            throw new UnauthorizedError('Вы не можете удалять чужие сессии.');
        }
        await this.sessionRepository.delete(session.id);
    }
    async deleteCurrentSession(context) {
        const session = await this.getCurrentSession(context);
        if (session) {
            await this.sessionRepository.delete(session.id);
        }
    }
}
