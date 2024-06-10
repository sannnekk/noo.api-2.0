import { MediaOptions } from '../../Media/MediaOptions.js';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
export const MediaHandler = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, MediaOptions.fileDestinationFolder);
        },
        filename(req, file, cb) {
            let name = `${uuid()}-${uuid()}`;
            switch (file.mimetype) {
                case 'image/jpeg':
                    name += '.jpg';
                    break;
                case 'image/png':
                    name += '.png';
                    break;
                case 'application/pdf':
                    name += '.pdf';
                    break;
            }
            cb(null, name);
        },
    }),
    fileFilter(req, file, callback) {
        if (!MediaOptions.allowedFileTypes.includes(file.mimetype)) {
            return callback(new Error('Только изображения формата JPG/JPEG, PNG и PDF-файлы разрешены.'));
        }
        callback(null, true);
    },
    limits: {
        fileSize: MediaOptions.maxFileSize,
        files: MediaOptions.maxFileCount,
    },
}).array('files');
