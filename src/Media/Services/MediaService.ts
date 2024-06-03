import { Media } from '../Data/Media'

type UnsavedMedia = Omit<Media, 'id' | 'createdAt' | 'updatedAt'>

export class MediaService {
	constructor() {}

	async upload(files: Express.Multer.File[]): Promise<UnsavedMedia[]> {
		return files.map((file) => ({
			src: file.filename,
			name: file.originalname,
			mimeType: file.mimetype as Media['mimeType'],
		}))
	}
}
