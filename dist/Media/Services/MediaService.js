import { NotFoundError } from '../../core/index.js';
import { MediaRepository } from '../Data/MediaRepository.js';
import fs from 'fs';
export class MediaService {
    mediaRepository;
    constructor() {
        this.mediaRepository = new MediaRepository();
    }
    async upload(files) {
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
        return files.map((file) => file.filename);
    }
    async remove(src) {
        const media = await this.mediaRepository.findOne({ src });
        if (!media) {
            throw new NotFoundError();
        }
        await fs.unlink(`../../noo-cdn/uploads/${src}`, () => { });
        await this.mediaRepository.delete(media.id);
    }
}
