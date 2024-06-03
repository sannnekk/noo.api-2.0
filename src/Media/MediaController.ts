import { Controller, Post } from 'express-controller-decorator'
import { MediaService } from './Services/MediaService'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { NoFilesProvidedError } from '@modules/core/Errors/NoFilesProvidedError'

@Controller('/media')
export class MediaController {
	private readonly mediaService: MediaService

	constructor() {
		this.mediaService = new MediaService()
	}

	@Post('/')
	public async get(context: Context): Promise<ApiResponse> {
		try {
			await Asserts.isAuthenticated(context)

			const requestFiles = await context.getFiles()

			if (!requestFiles?.length) {
				throw new NoFilesProvidedError()
			}

			const mediaFiles = await this.mediaService.upload(requestFiles)

			return new ApiResponse({ data: mediaFiles })
		} catch (error: any) {
			return new ApiResponse(error)
		}
	}
}
