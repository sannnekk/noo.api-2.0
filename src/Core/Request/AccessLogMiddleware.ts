import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import rawBody from 'raw-body'

export function AccessLogMiddleware(podId: string) {
	return async function (
		req: Request,
		res: Response,
		next: NextFunction
	) {
		const nowInHours = new Date().toISOString().slice(0, 13)
		const nowStr = new Date().toISOString()
		const mem = Math.round(process.memoryUsage().heapUsed / 1024 / 1024)

		const raw = await rawBody(req)
		const bodySize = Math.round(Buffer.byteLength(raw) / 1024)

		const str = `${nowStr} [${req.method}] ${res.statusCode} ${req.originalUrl} - Memory Usage: ${mem} MB, body size: ${bodySize} KB`

		await fs.appendFile(
			`./noo-cdn/uploads/access-log-${nowInHours}.log`,
			str + '\n',
			() => {}
		)

		next()
	}
}
