import { Request, Response, NextFunction } from 'express'
import path from 'path'
import TagService from '../services/tag.service'
import constants from '../common/constants'

class TagController {
  public async saveFileToTag(req: any, res: Response, next: NextFunction) {
    try {
      const { newFileName } = req.body
      const { metaDataObject } = req

      const blogDefaultUrl: string =
        process.env.SERVER_BLOG_DEFAULT_URL || 'localhost:5099'
      const blogRootPath: string = process.env.SERVER_BLOG_DIRECTORY || ''
      const tagDirPath = path.join(blogRootPath, constants.TAG_DIR_NAME)

      await TagService.saveBlogLinkToTagFile(
        blogDefaultUrl,
        tagDirPath,
        `${newFileName}.html`,
        metaDataObject
      )

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export default new TagController()
