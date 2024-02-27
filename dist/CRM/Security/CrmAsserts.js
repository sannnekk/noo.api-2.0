import { UnauthorizedError } from '../../core/index.js';
import { InternalError } from '../../core/Errors/InternalError.js';
function hasSecret(context) {
    if (process.env.WEBHOOK_SECRET === undefined) {
        throw new InternalError('Webhook secret is not set in environment variables');
    }
    if (context.params.secret !== process.env.WEBHOOK_SECRET) {
        throw new UnauthorizedError();
    }
}
export default { hasSecret };
