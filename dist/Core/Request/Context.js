import { UserRepository } from '../../Users/Data/UserRepository.js';
import { parseHeader } from '../Security/jwt.js';
import { RoleChangedButNotReloggedInError } from '../Errors/RoleChangedButNotReloggedInError.js';
export class Context {
    params;
    body;
    credentials;
    query;
    userRepository;
    constructor(req) {
        this.userRepository = new UserRepository();
        this.body = req.body;
        this.params = req.params;
        this.query = req.query;
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
            return;
        }
    }
    async isAuthenticated() {
        const username = this.credentials?.username;
        const claimedRole = this.credentials?.role;
        if (!username) {
            return false;
        }
        const user = await this.userRepository.findOne({ username });
        if (!user) {
            return false;
        }
        if (user.isBlocked) {
            return false;
        }
        if (claimedRole !== user.role) {
            throw new RoleChangedButNotReloggedInError();
        }
        return true;
    }
    setParams(params) {
        this.params = params;
    }
}
