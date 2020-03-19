import { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import moment from 'moment'
import FileDirHelpers from '../helpers/file-dir-helpers'
import Config from '../common/config'
import MyCustomHelpers from '../helpers/my-custom-helpers'

const { baseBlogImageLocation } = Config.getEnviromentVariables()
const upload: any = {}

/** Filter list */
const filter = {
  image: (req: any, file: any, cb: any) => {
    const allowTypes = ['image/gif', 'image/jpeg', 'image/svg+xml', 'image/png']
    if (!allowTypes.includes(file.mimetype)) {
      return cb(new Error('Only images are allowed'), false)
    }
    return cb(null, true)
  }
}

/** User avatar */
upload.uploadBlogImage = (req: any, res: Response, next: NextFunction) => {
  FileDirHelpers.createDirIfNotExistsOfGivenPath(baseBlogImageLocation)
  const storage = multer.diskStorage({
    destination: (_req, _file, _cb) => {
      _cb(null, baseBlogImageLocation)
    },
    filename: (_req, _file, _cb) => {
      _cb(
        null,
        `${moment.utc().format('YYYYMMDDhhmmss')}_${_file.originalname}`
      )
    }
  })
  const blogImageUpload = multer({ storage, fileFilter: filter.image }).single(
    'blog-img'
  )
  blogImageUpload(req, res, error => {
    if (error instanceof multer.MulterError) return next(error)
    if (error) return next(error)
    return next()
  })
}

export default upload
