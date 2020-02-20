import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import path from 'path'
import moment from 'moment'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlAndMarkdownService from '../services/html-markdown.service'
import APIError from '../helpers/api-error'
import APIResponse from '../helpers/api-response'
import constants from '../common/constants'

class BlogController {
  private markdownDirPath: string
  private htmlDirPath: string
  private blogRootPath: string

  constructor() {
    this.blogRootPath = process.env.SERVER_BLOG_DIRECTORY || ''
    this.markdownDirPath = path.join(
      this.blogRootPath,
      constants.MARKDOWN_DIR_NAME
    )
    this.htmlDirPath = path.join(this.blogRootPath, constants.HTML_DIR_NAME)

    console.log(this.markdownDirPath)
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

      return next()
    } catch (err) {
      return next(err)
    }
  }

  public renderEditorPage(req: any, res: Response, next: NextFunction) {
    try {
      const { filePath } = req.params
      const { rootDir } = req
      const markdownFilePath = path.join(this.markdownDirPath, filePath)

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

  // public async editBlog(req: Request, res: Response, next: NextFunction) {
  // try {
  // const fakeMetaData = {
  // title: 'this is a title',
  // date: new Date(),
  // publishMode: 'publish',
  // tags: ['weird-tag', 'ugly-tag', 'helpful-tag']
  // }

  // console.log('hey')
  // console.log(this.getMarkdownDirPath())
  // HtmlAndMarkdownService.editBlog(
  // this.getMarkdownDirPath(),
  // this.htmlDirPath,
  // 'file-hihi.md',
  // 'content',
  // '<p>content</p>',
  // fakeMetaData
  // )
  // } catch (error) {
  // return next(error)
  // }
  // }
}

export default new BlogController()
