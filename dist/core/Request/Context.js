import { parseHeader } from '../Security/jwt.js';
import { PermissionResolver } from '../Security/permissions.js';
export class Context {
    params;
    body;
    credentials;
    permissionResolver;
    query;
    files;
    constructor(req) {
        this.body = this.parseBody(req.body);
        this.params = req.params;
        this.query = req.query;
        if (req.method === 'POST' && req.path === '/media') {
            this.files = req.files || [];
        }
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
        this.permissionResolver = new PermissionResolver(this.credentials.permissions);
    }
    isAuthenticated() {
        return !!this.credentials;
    }
    setParams(params) {
        this.params = params;
    }
    parseBody(body) {
        return JSON.parse(JSON.stringify(body), (_, value) => {
            if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                return new Date(value);
            }
            return value;
        });
    }
}
