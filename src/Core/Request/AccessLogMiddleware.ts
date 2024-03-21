import { NextFunction, Request, Response } from 'express'
import fs from 'fs'

export async function AccessLogMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const nowInHours = new Date().toISOString().slice(0, 13)
	const nowStr = new Date().toISOString()
	const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

	const str = `${process.env.HOSTNAME} ${nowStr} [${req.method}] ${res.statusCode} ${req.originalUrl} - Memory Usage: ${mem} MB`

	await fs.appendFile(
		`./noo-cdn/uploads/access-log-${nowInHours}.log`,
		str + '\n',
		() => {}
	)

	next()
}
