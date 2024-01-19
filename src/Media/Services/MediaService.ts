import { AlreadyExistError, NotFoundError, UnknownError } from '@core'
import { MediaRepository } from '../Data/MediaRepository'
import { MediaModel } from '../Data/MediaModel'
import fs from 'fs'

export class MediaService {
	private readonly mediaRepository: MediaRepository

	constructor() {
		this.mediaRepository = new MediaRepository()
	}

	async upload(files: Express.Multer.File[]): Promise<void> {
		try {
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
		}
	}

	async remove(src: string): Promise<void> {
		const media = await this.mediaRepository.findOne({ src })

		if (!media) {
			throw new NotFoundError()
		}

		await fs.unlink(`../../noo-cdn/uploads/${src}`, () => {})
		await this.mediaRepository.delete(media.id)
	}
}
