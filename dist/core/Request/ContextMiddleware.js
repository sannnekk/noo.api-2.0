import { Context } from './Context.js';
export function ContextMiddleware(req, res, next) {
    // @ts-ignore
    req.context = new Context(req);
    next();
}
