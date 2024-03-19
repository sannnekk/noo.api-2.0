import { Context } from './Context'
import Express from 'express'

export function ContextMiddleware(
	req: Express.Request,
	res: Express.Response,
	next: Express.NextFunction
) {
	// @ts-ignore
	req.context = new Context(req)

	next()
}
