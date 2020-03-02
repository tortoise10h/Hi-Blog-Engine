import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import path from 'path'
import moment from 'moment'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlAndMarkdownService, {
  IMarkdownMetaDataObject
} from '../services/html-markdown.service'
import APIError from '../helpers/api-error'
import MyCustomHelpers from '../helpers/my-custom-helpers'
import APIResponse from '../helpers/api-response'
import constants from '../common/constants'

class BlogController {
  private readonly markdownDirPath: string
  private readonly htmlDirPath: string
  private readonly blogRootPath: string
  private readonly blogDefaultUrl: string

  constructor(
    blogRootPath: string,
    markdownDirPath: string,
    htmlDirPath: string,
    blogDefaultUrl: string
  ) {
    this.blogRootPath = blogRootPath
    this.markdownDirPath = markdownDirPath
    this.htmlDirPath = htmlDirPath
    this.blogDefaultUrl = blogDefaultUrl
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
      const blogHomePageLink: string = path.join(
        this.blogDefaultUrl,
        'index.html'
      )
      const tagUrl: string = path.join(
        this.blogDefaultUrl,
        constants.TAG_DIR_NAME,
        constants.TAG_HTML_DIR_NAME
      )
      const minRead = MyCustomHelpers.calculateMinRead(markdownContent)

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
        blogDate,
        blogHomePageLink,
        tagUrl
      )

      /** Get blog meta data object to use at next middleware -> save file to tag */
      const metaDataObject = HtmlAndMarkdownService.getMarkdownMetaData(
        markdownPath
      )

      req.metaDataObject = metaDataObject
      req.newFileName = newFileName
      req.minRead = minRead

      return next()
    } catch (err) {
      return next(err)
    }
  }

  public renderEditorPage(req: any, res: Response, next: NextFunction) {
    try {
      const { markdownFile } = req.params
      const { rootDir } = req
      const markdownFilePath = path.join(this.markdownDirPath, markdownFile)

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
        markdownContent,
        markdownFile
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
      const { markdownFile }: { markdownFile: string } = req.params
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
        markdownFile,
        '.md',
        '.html'
      )
      const blogHomePageLink: string = path.join(
        this.blogDefaultUrl,
        'index.html'
      )
      const minRead = MyCustomHelpers.calculateMinRead(markdownContent)
      const tagUrl: string = path.join(
        this.blogDefaultUrl,
        constants.TAG_DIR_NAME,
        constants.TAG_HTML_DIR_NAME
      )
      const markdownFilePath = path.join(this.markdownDirPath, markdownFile)

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
        markdownFile,
        htmlFile,
        markdownContent,
        htmlContent,
        metaDataObject,
        blogHomePageLink,
        tagUrl
      )

      /** Old data to compare link in old tag and remove & new data will use to create new link
       * Handle those jobs in tag controller
       * */
      req.oldBlogMetaDataObject = oldBlogMetaDataObject
      req.newBlogMetaDatObject = metaDataObject
      req.htmlFile = htmlFile
      req.minRead = minRead

      return next()
    } catch (error) {
      return next(error)
    }
  }

  public deleteBlog(req: any, res: Response, next: NextFunction) {
    try {
      const { markdownFile }: { markdownFile: string } = req.params
      const markdownFilePath: string = path.join(
        this.blogRootPath,
        constants.MARKDOWN_DIR_NAME,
        markdownFile
      )
      const htmlFile: string = FileDirHelpers.changeFileExtension(
        markdownFile,
        '.md',
        '.html'
      )
      const htmlFilePath: string = path.join(
        this.blogRootPath,
        constants.HTML_DIR_NAME,
        htmlFile
      )

      if (!FileDirHelpers.isFileExisted(markdownFilePath)) {
        return next(new APIError(httpStatus.BAD_REQUEST, 'File is not existed'))
      }

      /** Get old meta data before delete this blog to use at the next middleware */
      const metaDataObject: IMarkdownMetaDataObject = HtmlAndMarkdownService.getMarkdownMetaData(
        markdownFilePath
      )

      HtmlAndMarkdownService.deteleHtmlAndMarkdownFile(
        htmlFilePath,
        markdownFilePath
      )

      /** Pass old meta data object to req to use at next middleware */
      req.metaDataObject = metaDataObject
      req.markdownFile = markdownFile

      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export default BlogController
