import { Request, Response, NextFunction } from 'express'
import path from 'path'
import TagService from '../services/tag.service'
import constants from '../common/constants'

class TagController {
  private readonly blogDefaultUrl: string
  private readonly blogRootPath: string
  private readonly tagDirPath: string

  constructor() {
    this.blogDefaultUrl =
      process.env.SERVER_BLOG_DEFAULT_URL || 'htt://localhost:5099'
    this.blogRootPath = process.env.SERVER_BLOG_DIRECTORY || ''
    this.tagDirPath = path.join(this.blogRootPath, constants.TAG_DIR_NAME)
  }

  public async saveFileToTag(req: any, res: Response, next: NextFunction) {
    try {
      const { newFileName } = req.body
      const { metaDataObject } = req

      await TagService.saveBlogLinkToTagFile(
        this.blogDefaultUrl,
        this.tagDirPath,
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
