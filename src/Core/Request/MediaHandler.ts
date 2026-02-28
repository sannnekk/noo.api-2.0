import { Media } from '@modules/Media/Data/Media'
import { MediaOptions } from '@modules/Media/MediaOptions'
import multer from 'multer'
import { v4 as uuid } from 'uuid'
import { AppError } from '../Errors/AppError'
import fs from 'fs'
import path from 'path'

export const MediaHandler = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.join(
        MediaOptions.fileDestinationFolder,
        MediaOptions.getFileSubdir()
      )

      // Check if directory exists, if not, create it
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      cb(null, dir)
    },
    filename(req, file, cb) {
      let name = `${uuid()}-${uuid()}`

      switch (file.mimetype as Media['mimeType']) {
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
    if (!MediaOptions.allowedFileTypes.includes(file.mimetype)) {
      return callback(
        new AppError(
          'Только изображения формата JPG/JPEG, PNG и PDF-файлы разрешены.'
        )
      )
    }

    callback(null, true)
  },
  limits: {
    fileSize: MediaOptions.maxFileSize,
    files: MediaOptions.maxFileCount,
  },
}).array('files')
