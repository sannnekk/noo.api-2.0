import multer from 'multer'
import getSlug from 'speakingurl'
import { v4 as uuid } from 'uuid'

export const MediaMiddleware = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, '/noo-cdn/uploads')
		},
		filename: function (req, file, cb) {
			let name = getSlug(file.originalname) + '_' + uuid().slice(0, 3)

			switch (file.mimetype) {
				case 'image/jpeg':
					name += '.jpg'
					break
				case 'image/png':
					name += '.png'
					break
				case 'application/pdf':
					name += '.pdf'
					break
			}

			cb(null, name)
		},
	}),
	fileFilter(req, file, callback) {
		if (req.path !== '/media') {
			return callback(new Error('File upload is not allowed here'))
		}

		if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
			return callback(
				new Error(
					'Только изображения формата JPG/JPEG, PNG и PDF-файлы разрешены.'
				)
			)
		}

		if (file.size > 1024 * 1024 * 50) {
			return callback(
				new Error('Слишком большой файл. Максимальный размер 50МБ.')
			)
		}

		callback(null, true)
	},
	limits: {
		fileSize: 1024 * 1024 * 50,
	},
}).array('files')
