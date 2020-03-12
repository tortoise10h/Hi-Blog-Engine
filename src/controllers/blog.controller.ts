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
        markdownPath,
        htmlPath
      } = this.createNewHtmlAndMarkdownFilePathByPublishMode(
        newFileName,
        blogPublishMode
      )

      if (FileDirHelpers.isFileExisted(markdownPath)) {
        return next(
          new APIError(httpStatus.BAD_REQUEST, 'file name is already existed')
        )
      }

      /** Save html & markdown path */
      await HtmlAndMarkdownService.saveMarkdownandHtmlFileProcess(
        htmlPath,
        markdownPath,
        htmlContent,
        markdownContent,
        {
          tags: blogTagsArray,
          title: blogTitle,
          publishMode: blogPublishMode,
          date: blogDate
        },
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

  public createNewHtmlAndMarkdownFilePathByPublishMode(
    newFileName: string,
    publishMode: string
  ) {
    let htmlPath: string
    let markdownPath: string
    if (publishMode === constants.PUBLISH_MODES.PRIVATE) {
      htmlPath = path.join(
        this.blogRootPath,
        constants.PRIVATE_DIR_NAME,
        constants.HTML_DIR_NAME,
        `${newFileName}.html`
      )
      markdownPath = path.join(
        this.blogRootPath,
        constants.PRIVATE_DIR_NAME,
        constants.MARKDOWN_DIR_NAME,
        `${newFileName}.md`
      )
    } else {
      htmlPath = path.join(
        this.blogRootPath,
        constants.HTML_DIR_NAME,
        `${newFileName}.html`
      )
      markdownPath = path.join(
        this.blogRootPath,
        constants.MARKDOWN_DIR_NAME,
        `${newFileName}.md`
      )
    }
    return {
      htmlPath,
      markdownPath
    }
  }

  public renderEditorPage(req: any, res: Response, next: NextFunction) {
    try {
      const { markdownFile } = req.params
      const { rootDir } = req
      const { markdownFilePath } = FileDirHelpers.getOldBlogHtmlAndMarkdownPath(
        markdownFile,
        this.blogRootPath
      )

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

      /** Make sure edit file is exists */
      if (!this.isEditFileExist(markdownFile)) {
        return next(
          new APIError(
            httpStatus.BAD_REQUEST,
            `File ${markdownFile} doesn't exist`
          )
        )
      }

      /** Handle file location after edit publish mode */
      // get old file to get old metaDataObject and remove it to take place for edited file */
      const {
        htmlFilePath: oldHtmlFilePath,
        markdownFilePath: oldMarkdownFilePath
      } = FileDirHelpers.getOldBlogHtmlAndMarkdownPath(
        markdownFile,
        this.blogRootPath
      )
      // new file location
      const {
        htmlFilePath,
        markdownFilePath
      } = FileDirHelpers.createHtmlAndMarkdownFilePathByPublishMode(
        metaDataObject.publishMode,
        this.blogRootPath,
        markdownFile,
        htmlFile
      )

      const oldBlogMetaDataObject: IMarkdownMetaDataObject = HtmlAndMarkdownService.getMarkdownMetaData(
        oldMarkdownFilePath
      )

      /** Remove old html and markdown file to add new edited files */
      FileDirHelpers.removeFilePromise(oldMarkdownFilePath)
      FileDirHelpers.removeFilePromise(oldHtmlFilePath)

      /** Make sure all directories to store file is ready */
      FileDirHelpers.createDirIfNotExistsOfGivenPath(markdownFilePath)
      FileDirHelpers.createDirIfNotExistsOfGivenPath(htmlFilePath)

      await HtmlAndMarkdownService.editBlog(
        markdownFilePath,
        htmlFilePath,
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

  public isEditFileExist(markdownFile: string) {
    try {
      const markdownFilePath: string = path.join(
        this.blogRootPath,
        constants.MARKDOWN_DIR_NAME,
        markdownFile
      )
      const markdownPrivateFilePath: string = path.join(
        this.blogRootPath,
        constants.PRIVATE_DIR_NAME,
        constants.MARKDOWN_DIR_NAME,
        markdownFile
      )

      if (
        FileDirHelpers.isFileExisted(markdownFilePath) ||
        FileDirHelpers.isFileExisted(markdownPrivateFilePath)
      ) {
        return true
      }

      return false
    } catch (error) {
      throw error
    }
  }

  public deleteBlog(req: any, res: Response, next: NextFunction) {
    try {
      const { markdownFile }: { markdownFile: string } = req.params

      const {
        htmlFilePath,
        markdownFilePath
      } = FileDirHelpers.getOldBlogHtmlAndMarkdownPath(
        markdownFile,
        this.blogRootPath
      )

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
