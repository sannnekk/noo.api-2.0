import { UserRepository } from '../../Users/Data/UserRepository.js';
import { parseHeader } from '../Security/jwt.js';
import { RoleChangedButNotReloggedInError } from '../Errors/RoleChangedButNotReloggedInError.js';
import { MediaHandler } from './MediaHandler.js';
import { parseUserAgent } from '../Utils/userAgent.js';
import { SessionService } from '../../Sessions/Services/SessionService.js';
export class Context {
    method = 'UNKNOWN';
    path = '/';
    params;
    body;
    credentials;
    query;
    _req;
    info;
    userRepository;
    sessionService;
    constructor(req) {
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            this._req = req;
        }
        this.userRepository = new UserRepository();
        this.sessionService = new SessionService();
        this.method = req.method;
        this.path = req.path;
        this.body = req.body;
        this.params = req.params;
        this.query = req.query;
        this.info = this.getRequestInfo(req);
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return;
        }
        this.credentials = parseHeader(authHeader);
        if (!this.credentials) {
            return;
        }
        if (this.credentials.isBlocked) {
            this.credentials = undefined;
        }
    }
    async isAuthenticated() {
        const username = this.credentials?.username;
        const claimedRole = this.credentials?.role;
        const sessionId = this.credentials?.sessionId;
        if (!username || !sessionId) {
            return false;
        }
        const user = await this.userRepository.findOne({ username }, undefined, undefined, { useEagerRelations: false });
        if (!user) {
            return false;
        }
        if (user.isBlocked) {
            return false;
        }
        if (claimedRole !== user.role) {
            throw new RoleChangedButNotReloggedInError();
        }
        const session = await this.sessionService.getCurrentSession(this);
        if (!session) {
            return false;
        }
        await this.sessionService.updateSession(session, this);
        return true;
    }
    async getFiles() {
        if (!this._req) {
            return [];
        }
        return new Promise((resolve, reject) => {
            const req = this._req;
            MediaHandler(req, undefined, (error) => {
                if (req?.files && Array.isArray(req.files)) {
                    resolve(req.files);
                }
                else {
                    reject(error);
                }
            });
        });
    }
    getRequestInfo(req) {
        const userAgent = req.header('User-Agent') || '';
        const isMobile = /Mobi/.test(userAgent);
        const ipAddress = req.ip || '';
        const browser = parseUserAgent(req.header('User-Agent') || '').browser || '';
        const os = parseUserAgent(req.header('User-Agent') || '').os || '';
        const device = parseUserAgent(req.header('User-Agent') || '').device || '';
        return {
            userAgent,
            isMobile,
            ipAddress,
            browser,
            os,
            device,
        };
    }
}
