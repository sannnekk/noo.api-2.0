import { SessionRepository } from '../Data/SessionRepository.js';
import { SessionModel } from '../Data/SessionModel.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import date from '../../Core/Utils/date.js';
import { SessionOptions } from '../SessionsOptions.js';
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
    async getCurrentSession(context, userId) {
        if (userId) {
            return this.sessionRepository.findOne({
                user: { id: userId },
                userAgent: context.info.userAgent,
            });
        }
        return this.sessionRepository.findOne({
            id: context.credentials.sessionId,
            userAgent: context.info.userAgent,
        });
    }
    async createSession(context, userId) {
        const session = new SessionModel();
        session.user = { id: userId };
        session.userAgent = context.info.userAgent;
        session.isMobile = context.info.isMobile;
        session.device = context.info.device || null;
        session.os = context.info.os || null;
        session.browser = context.info.browser || null;
        session.ipAddress = context.info.ipAddress;
        session.lastRequestAt = new Date();
        return this.sessionRepository.create(session);
    }
    async getOnlineUsersCount() {
        return this.sessionRepository.countOnlineUsers();
    }
    async getOnlineStatus(userId) {
        // find last session for user
        const session = await this.sessionRepository.findLast(userId);
        if (!session) {
            return {
                isOnline: false,
                lastRequestAt: null,
                isLastRequestMobile: false,
            };
        }
        return {
            isOnline: date.isInLast(session.lastRequestAt, SessionOptions.onlineThreshold),
            lastRequestAt: session.lastRequestAt,
            isLastRequestMobile: session.isMobile,
        };
    }
    getOnlineStatusForUser(user) {
        const session = user.sessions
            ?.sort((a, b) => {
            return date.compare(a.lastRequestAt, b.lastRequestAt);
        })
            .at(0);
        if (!session) {
            return {
                ...user,
                isOnline: false,
                lastRequestAt: null,
                isLastRequestMobile: false,
            };
        }
        return {
            ...user,
            isOnline: date.isInLast(session.lastRequestAt, SessionOptions.onlineThreshold),
            lastRequestAt: session.lastRequestAt,
            isLastRequestMobile: session.isMobile,
        };
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
