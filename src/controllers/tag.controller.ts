import { Request, Response, NextFunction } from 'express'
import path from 'path'
import util from 'util'
import TagService from '../services/tag.service'
import FileDirHelpers from '../helpers/file-dir-helpers'
import { IMarkdownMetaDataObject } from '../services/html-markdown.service'
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
      const { markdownFile } = req.params
      const { newBlogMetaDatObject, oldBlogMetaDataObject } = req
      const htmlFile = FileDirHelpers.changeFileExtension(
        markdownFile,
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

  public async removeDeletedBlogLinkFromTag(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        metaDataObject,
        markdownFile
      }: { metaDataObject: IMarkdownMetaDataObject; markdownFile: string } = req
      const htmlFile = FileDirHelpers.changeFileExtension(
        markdownFile,
        '.md',
        '.html'
      )
      const blogLink = path.join(
        this.blogDefaultUrl,
        constants.HTML_DIR_NAME,
        htmlFile
      )

      await TagService.removeDeletedBlogLinkFromTags(
        metaDataObject.tags,
        this.tagDirPath,
        blogLink
      )

      req.blogLink = blogLink

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export default TagController
