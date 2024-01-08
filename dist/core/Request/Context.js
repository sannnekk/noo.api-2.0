import { parseHeader } from '../Security/jwt';
import { PermissionResolver } from '../Security/permissions';
export class Context {
    body;
    params;
    credentials;
    permissionResolver;
    constructor(req) {
        this.body = req.body;
        this.params = req.params;
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return;
        }
        this.credentials = parseHeader(authHeader);
        if (!this.credentials) {
            return;
        }
        this.permissionResolver = new PermissionResolver(this.credentials.permissions);
    }
    isAuthenticated() {
        return !!this.credentials;
    }
}
