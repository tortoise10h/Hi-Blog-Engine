import { Request, Response, NextFunction } from 'express'
import path from 'path'
import util from 'util'
import TagService from '../services/tag.service'
import FileDirHelpers from '../helpers/file-dir-helpers'
import { IMarkdownMetaDataObject } from '../services/html-markdown.service'
import constants from '../common/constants'
import APIResponse from '../helpers/api-response'
import MyCustomHelpers from '../helpers/my-custom-helpers'

class TagController {
  private readonly blogDefaultUrl: string
  private readonly tagDirPath: string
  private readonly tagHtmlDirPath: string
  private readonly tagConfigDirPath: string
  private readonly tagUrl: string

  constructor(
    blogDefaultUrl: string,
    tagDirPath: string,
    tagHtmlDirPath: string,
    tagConfigDirPath: string,
    tagUrl: string
  ) {
    this.blogDefaultUrl = blogDefaultUrl
    this.tagDirPath = tagDirPath
    this.tagConfigDirPath = tagConfigDirPath
    this.tagHtmlDirPath = tagHtmlDirPath
    this.tagUrl = tagUrl
  }

  public async saveFileToTag(req: any, res: Response, next: NextFunction) {
    try {
      const { newFileName } = req.body
      const { metaDataObject, minRead } = req

      /** Make sure all directories that is used to store file are created */
      FileDirHelpers.createDirIfNotExistsOfGivenPath(this.tagConfigDirPath)
      FileDirHelpers.createDirIfNotExistsOfGivenPath(this.tagHtmlDirPath)

      await TagService.saveNewBlogLinkToTags(
        this.blogDefaultUrl,
        this.tagUrl,
        this.tagDirPath,
        `${newFileName}.html`,
        metaDataObject,
        minRead
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
      const { newBlogMetaDatObject, oldBlogMetaDataObject, minRead } = req
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

      if (
        oldBlogMetaDataObject.publishMode === constants.PUBLISH_MODES.PUBLISH &&
        newBlogMetaDatObject.publishMode === constants.PUBLISH_MODES.PUBLISH
      ) {
        await TagService.handleTagsOfBlogAfterEditBlog(
          newBlogMetaDatObject,
          oldBlogMetaDataObject,
          blogLink,
          this.tagDirPath,
          this.blogDefaultUrl,
          htmlFile,
          this.tagUrl,
          minRead
        )
      } else if (
        oldBlogMetaDataObject.publishMode === constants.PUBLISH_MODES.PRIVATE &&
        newBlogMetaDatObject.publishMode === constants.PUBLISH_MODES.PUBLISH
      ) {
        await TagService.writeNewBlogLinkToTagsProcess(
          this.tagDirPath,
          this.tagUrl,
          blogLink,
          newBlogMetaDatObject,
          minRead
        )
      } else if (
        oldBlogMetaDataObject.publishMode === constants.PUBLISH_MODES.PUBLISH &&
        newBlogMetaDatObject.publishMode === constants.PUBLISH_MODES.PRIVATE
      ) {
        await TagService.removeDeletedBlogLinkFromTags(
          oldBlogMetaDataObject.tags,
          this.tagDirPath,
          blogLink,
          this.tagUrl
        )
      }
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

      /** If delete file is different from private then remove them from all tags */
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
      //if (metaDataObject.publishMode !== constants.PUBLISH_MODES.PRIVATE) {
      await TagService.removeDeletedBlogLinkFromTags(
        metaDataObject,
        this.tagDirPath,
        blogLink,
        this.tagUrl
      )
      //}

      req.blogLink = blogLink

      return next()
    } catch (error) {
      return next(error)
    }
  }

  public async updateAllCurrentTagsInEachTagFile(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      await TagService.updateAllCurrentTagsInEachTagFile(
        this.tagDirPath,
        this.tagUrl
      )

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export default TagController
