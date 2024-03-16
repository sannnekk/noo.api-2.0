import { parseHeader } from '../Security/jwt';
import { PermissionResolver } from '../Security/permissions';
export class Context {
    body;
    params;
    credentials;
    permissionResolver;
    query;
    _express = {
        req: null,
        res: null,
        next: null,
    };
    constructor(req, res, next) {
        this._express.req = req;
        this._express.res = res;
        this._express.next = next;
        this.body = this.parseBody(req.body);
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
        this.permissionResolver = new PermissionResolver(this.credentials.permissions);
        if (req.files) {
            req.body = req.files;
        }
    }
    isAuthenticated() {
        return !!this.credentials;
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
