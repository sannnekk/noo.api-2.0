import { Context } from '@modules/Core/Request/Context'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { InternalError } from '@modules/Core/Errors/InternalError'

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
