import { NextFunction, Request, Response } from 'express'
import { Middleware } from 'express-controller-decorator'
import multer from 'multer'

export class MediaMiddleware implements Middleware {
	async use(request: Request, response: Response, next: NextFunction) {
		multer({
			dest: '../../noo-cdn/uploads',
			fileFilter(req, file, callback) {
				if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
					return callback(new Error('Only images and pdfs are allowed'))
				}

				if (file.size > 1024 * 1024 * 15) {
					return callback(new Error('File too large'))
				}

				callback(null, true)
			},
		}).array('files')(request, response, next)
	}
}
