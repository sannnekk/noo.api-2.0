export class MediaService {
    async upload(files) {
        return files.map((file) => ({
            src: file.filename,
            name: file.originalname,
            mimeType: file.mimetype,
        }));
    }
}
