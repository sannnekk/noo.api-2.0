import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { MediaRepository } from '../Data/MediaRepository'
import fs from 'fs'

export class MediaService {
	private readonly mediaRepository: MediaRepository

	constructor() {
		this.mediaRepository = new MediaRepository()
	}

	async upload(files: Express.Multer.File[]): Promise<string[]> {
		/* try {
			await this.mediaRepository.createMany(
				files.map(
					(file) =>
						new MediaModel({
							src: file.filename,
							mimeType: file.mimetype as MediaModel['mimeType'],
						})
				)
			)
		} catch (error: any) {
			if (error.code === '23505') {
				throw new AlreadyExistError()
			}

			throw new UnknownError()
		} */

		return files.map((file) => file.filename)
	}
}
