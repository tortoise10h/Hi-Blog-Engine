import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlAndMarkdownService from '../services/html-markdown.service'
import APIError from '../helpers/api-error'

class BlogController {
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
}

export default new BlogController()
