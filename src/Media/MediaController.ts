import { Controller, Delete, Post } from 'express-controller-decorator'
import { MediaService } from './Services/MediaService'
import { ApiResponse, Asserts, Context } from '@core'

@Controller('/media')
export class MediaController {
	private readonly mediaService: MediaService

	constructor() {
		this.mediaService = new MediaService()
	}

	@Post()
	public async get(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)

			const links = await this.mediaService.upload(
				context._express.req!.files as Express.Multer.File[]
			)

			return new ApiResponse({ data: { links } })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}

	@Delete()
	public async delete(context: Context): Promise<ApiResponse> {
		try {
			Asserts.isAuthenticated(context)
			Asserts.teacherOrAdmin(context)

			await this.mediaService.remove(context.query.src as string)

			return new ApiResponse(null)
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
