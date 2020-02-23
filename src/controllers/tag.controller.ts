import { Request, Response, NextFunction } from 'express'
import path from 'path'
import TagService from '../services/tag.service'
import FileDirHelpers from '../helpers/file-dir-helpers'
import constants from '../common/constants'
import APIResponse from '../helpers/api-response'

class TagController {
  private readonly blogDefaultUrl: string
  private readonly blogRootPath: string
  private readonly tagDirPath: string

  constructor(
    blogRootPath: string,
    blogDefaultUrl: string,
    tagDirPath: string
  ) {
    this.blogDefaultUrl = blogDefaultUrl
    this.blogRootPath = blogRootPath
    this.tagDirPath = tagDirPath
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

  public async handleTagsOfBlogEdit(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { editedFile } = req.params
      const { newBlogMetaDatObject, oldBlogMetaDataObject } = req
      const htmlFile = FileDirHelpers.changeFileExtension(
        editedFile,
        '.md',
        '.html'
      )
      const blogLink: string = path.join(
        this.blogDefaultUrl,
        constants.HTML_DIR_NAME,
        htmlFile
      )

      TagService.handleTagOfBlogEdit(
        newBlogMetaDatObject,
        oldBlogMetaDataObject,
        blogLink,
        this.tagDirPath,
        this.blogDefaultUrl,
        htmlFile
      )

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export default TagController
