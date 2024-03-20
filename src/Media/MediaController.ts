import { Controller, Post, Req, Res } from '@decorators/express'
import { MediaService } from './Services/MediaService'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { MediaMiddleware } from '@modules/Core/Request/MediaMiddleware'
import { getErrorData } from '@modules/Core/Response/helpers'
import { Request, Response } from 'express'

@Controller('/media')
export class MediaController {
	private readonly mediaService: MediaService

	constructor() {
		this.mediaService = new MediaService()
	}

	@Post('/', [MediaMiddleware])
	public async get(@Req() req: Request, @Res() res: Response) {
		// @ts-ignore
		const context = req.context as Context

		try {
			Asserts.isAuthenticated(context)

			const links = await this.mediaService.upload(
				context.files as Express.Multer.File[]
			)

			res.status(201).send({ data: links })
		} catch (error: any) {
			const { status, message } = getErrorData(error)
			res.status(status).send({ error: message })
		}
	}
}
