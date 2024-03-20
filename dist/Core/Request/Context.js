import { parseHeader } from '../Security/jwt.js';
export class Context {
    params;
    body;
    credentials;
    query;
    constructor(req) {
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
    isAuthenticated() {
        return !!this.credentials;
    }
    setParams(params) {
        this.params = params;
    }
}
