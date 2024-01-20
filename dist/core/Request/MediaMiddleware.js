import multer from 'multer';
import { v4 as uuid } from 'uuid';
export const MediaMiddleware = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '../noo-cdn/uploads');
        },
        filename: function (req, file, cb) {
            let name = uuid();
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
    fileFilter(_, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
            return callback(new Error('Only images and pdfs are allowed'));
        }
        if (file.size > 1024 * 1024 * 15) {
            return callback(new Error('File too large'));
        }
        callback(null, true);
    },
}).array('files');
