import { Media } from '../Data/Media'
import { MediaOptions } from '../MediaOptions'

type UnsavedMedia = Omit<Media, 'id' | 'createdAt' | 'updatedAt' | 'order'>

export class MediaService {
  async upload(files: Express.Multer.File[]): Promise<UnsavedMedia[]> {
    return files.map((file) => ({
      src: MediaOptions.getFileSubdir() + '/' + file.filename,
      name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      mimeType: file.mimetype as Media['mimeType'],
    }))
  }
}
