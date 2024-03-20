import { Context } from '@modules/core/Request/context'
import { UnauthorizedError } from '@modules/core/Errors/UnauthorizedError'
import { InternalError } from '@modules/core/Errors/InternalError'

function hasSecret(context: Context): void {
	if (process.env.WEBHOOK_SECRET === undefined) {
		throw new InternalError(
			'Webhook secret is not set in environment variables'
		)
	}

	if (context.query.secret !== process.env.WEBHOOK_SECRET) {
		throw new UnauthorizedError()
	}
}

export default { hasSecret }
