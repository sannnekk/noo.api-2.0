import {
	ControllerResponse,
	Delete,
	Get,
	Post,
} from 'express-controller-decorator'
import { MediaMiddleware } from './MediaMiddleware'
import { MediaService } from './Services/MediaService'
import { StatusCodes } from 'http-status-codes'
import { Asserts, Context } from '@core'

@Get('/media')
export class MediaController {
	private readonly mediaService: MediaService

	constructor() {
		this.mediaService = new MediaService()
	}

	@Post('', new MediaMiddleware())
	public async get(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			await this.mediaService.upload(
				context.body as Express.Multer.File[]
			)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (e: any) {
			return new ControllerResponse(
				null,
				e.code || StatusCodes.BAD_REQUEST
			)
		}
	}

	@Delete()
	public async delete(context: Context): Promise<ControllerResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			await this.mediaService.remove(context.query.src as string)

			return new ControllerResponse(null, StatusCodes.NO_CONTENT)
		} catch (e: any) {
			return new ControllerResponse(
				null,
				e.code || StatusCodes.BAD_REQUEST
			)
		}
	}
}
