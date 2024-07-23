import { MediaOptions } from '../MediaOptions.js';
export class MediaService {
    async upload(files) {
        return files.map((file) => ({
            src: MediaOptions.getFileSubdir() + '/' + file.filename,
            name: Buffer.from(file.originalname, 'latin1').toString('utf8'),
            mimeType: file.mimetype,
        }));
    }
}
