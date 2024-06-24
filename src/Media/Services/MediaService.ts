import { Media } from '../Data/Media'

type UnsavedMedia = Omit<Media, 'id' | 'createdAt' | 'updatedAt'>

export class MediaService {
  async upload(files: Express.Multer.File[]): Promise<UnsavedMedia[]> {
    return files.map((file) => ({
      src: file.filename,
      name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      mimeType: file.mimetype as Media['mimeType'],
    }))
  }
}
