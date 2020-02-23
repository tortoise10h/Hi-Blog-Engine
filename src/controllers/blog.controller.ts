import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import path from 'path'
import moment from 'moment'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlAndMarkdownService, {
  IMarkdownMetaDataObject
} from '../services/html-markdown.service'
import APIError from '../helpers/api-error'
import APIResponse from '../helpers/api-response'
import constants from '../common/constants'

class BlogController {
  private readonly markdownDirPath: string
  private readonly htmlDirPath: string
  private readonly blogRootPath: string

  constructor(
    blogRootPath: string,
    markdownDirPath: string,
    htmlDirPath: string
  ) {
    this.blogRootPath = blogRootPath
    this.markdownDirPath = markdownDirPath
    this.htmlDirPath = htmlDirPath
  }

  public async saveBlog(req: any, res: Response, next: NextFunction) {
    try {
      const {
        htmlContent,
        markdownContent,
        blogTagsArray,
        blogTitle,
        blogPublishMode,
        blogDate,
        newFileName
      } = req.body

      /** Check files exist or not */
      const {
        markdownPath
      } = HtmlAndMarkdownService.createHtmlandMarkdownPaths(newFileName)
      if (FileDirHelpers.isFileExisted(markdownPath)) {
        return next(
          new APIError(httpStatus.BAD_REQUEST, 'file name is already existed')
        )
      }

      /** Save html & markdown path */
      await HtmlAndMarkdownService.saveMarkdownandHtmlFileProcess(
        newFileName,
        htmlContent,
        markdownContent,
        blogTagsArray,
        blogTitle,
        blogPublishMode,
        blogDate
      )

      /** Get blog meta data object to use at next middleware -> save file to tag */
      const metaDataObject = HtmlAndMarkdownService.getMarkdownMetaData(
        markdownPath
      )

      req.metaDataObject = metaDataObject
      req.newFileName = newFileName

      return next()
    } catch (err) {
      return next(err)
    }
  }

  public renderEditorPage(req: any, res: Response, next: NextFunction) {
    try {
      const { editedFile } = req.params
      const { rootDir } = req
      console.log(`this: ${this}`)
      const markdownFilePath = path.join(this.markdownDirPath, editedFile)

      const {
        metaDataObject,
        markdownContent
      } = HtmlAndMarkdownService.getBlogEditInfo(markdownFilePath)

      /** Parse date in meta data to set default value in input date */
      metaDataObject.dateString = moment(metaDataObject.date).format(
        'YYYY-MM-DD'
      )

      res.render('edit-page', {
        rootDir,
        metaDataObject,
        markdownContent
      })
    } catch (error) {
      return next(error)
    }
  }

  public getMarkdownDirPath() {
    return this.markdownDirPath
  }

  public async editBlog(req: any, res: Response, next: NextFunction) {
    try {
      const { editedFile }: { editedFile: string } = req.params
      const {
        markdownContent,
        htmlContent,
        metaDataObject
      }: {
        markdownContent: string
        htmlContent: string
        metaDataObject: IMarkdownMetaDataObject
      } = req.body
      const htmlFile = FileDirHelpers.changeFileExtension(
        editedFile,
        '.html',
        '.md'
      )
      const markdownFilePath = path.join(this.markdownDirPath, editedFile)

      /** Make sure edit file is exists */
      if (!FileDirHelpers.isFileExisted(markdownFilePath)) {
        return next(
          new APIError(
            httpStatus.BAD_REQUEST,
            `File ${markdownFilePath} doesn't exist`
          )
        )
      }

      const oldBlogMetaDataObject: IMarkdownMetaDataObject = HtmlAndMarkdownService.getMarkdownMetaData(
        markdownFilePath
      )

      await HtmlAndMarkdownService.editBlog(
        this.markdownDirPath,
        this.htmlDirPath,
        editedFile,
        htmlFile,
        markdownContent,
        htmlContent,
        metaDataObject
      )

      /** Old data to compare link in old tag and remove & new data will use to create new link
       * Handle those jobs in tag controller
       * */
      req.oldBlogMetaDataObject = oldBlogMetaDataObject
      req.newBlogMetaDatObject = metaDataObject
      req.htmlFile = htmlFile

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export default BlogController
