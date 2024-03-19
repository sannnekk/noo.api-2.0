import { Controller, Delete, Post, Req, Res } from '@decorators/express'
import { MediaService } from './Services/MediaService'
import { Asserts, Context } from '@core'
import { Request, Response } from 'express'
import { getErrorData } from '@modules/Core/Response/helpers'

@Controller('/media')
export class MediaController {
	private readonly mediaService: MediaService

	constructor() {
		this.mediaService = new MediaService()
	}

	@Post('/')
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
