import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import fs from 'fs'
import path from 'path'
import FileDirHelpers from '../helpers/file-dir-helpers'
import BlogDirectoryService from '../services/blog-directory.service'
import APIError from '../helpers/api-error'
import constants from '../common/constants'
import APIResponse from '../helpers/api-response'

class BlogDirectoryController {
  public async checkValidRootBlogDirectory(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      /** Check valid root blog dir path */
      const { isOk, message } = BlogDirectoryService.isBlogDirectoryValid(
        process.env.SERVER_BLOG_DIRECTORY || ''
      )
      if (!isOk) {
        return next(new APIError(httpStatus.BAD_REQUEST, message))
      }

      /** Check markdown directory and create if is doesn't exist */
      FileDirHelpers.createDirectoryIfNotExists(
        `${process.env.SERVER_BLOG_DIRECTORY}/${constants.MARKDOWN_DIR_NAME}`
      )

      return next()
    } catch (err) {
      return next(err)
    }
  }

  public getAllMarkdownFiles(req: any, res: Response, next: NextFunction) {
    try {
      const markdownDirPath: string = `${process.env.SERVER_BLOG_DIRECTORY}/${constants.MARKDOWN_DIR_NAME}`
      const rootDir = fs.readdirSync(markdownDirPath)

      /** Pass all directories and files inside markdown directory to req and move to next middleware */
      req.rootDir = rootDir

      return next()
    } catch (err) {
      return next(err)
    }
  }

  public async checkAndCreateMissingFileInHtmlDir(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const markdownDirPath: string = path.join(
        process.env.SERVER_BLOG_DIRECTORY || '',
        constants.MARKDOWN_DIR_NAME
      )
      const htmlDirPath: string = path.join(
        process.env.SERVER_BLOG_DIRECTORY || '',
        constants.HTML_DIR_NAME
      )

      await BlogDirectoryService.createMissingFilesInHtmlDirFromMarkdownDir(
        markdownDirPath,
        htmlDirPath
      )
      return next()
    } catch (error) {
      return next(error)
    }
  }

  public async generateIndexHtmlFile(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const blogRootPath: string = process.env.SERVER_BLOG_DIRECTORY || ''
      const blogDefaultUrl: string = process.env.SERVER_BLOG_DEFAULT_URL || ''
      const markdownDirPath: string = path.join(
        process.env.SERVER_BLOG_DIRECTORY || '',
        constants.MARKDOWN_DIR_NAME
      )
      const htmlDirPath: string = path.join(
        process.env.SERVER_BLOG_DIRECTORY || '',
        constants.HTML_DIR_NAME
      )

      await BlogDirectoryService.generateIndexHtmlFile(
        blogRootPath,
        blogDefaultUrl,
        htmlDirPath,
        markdownDirPath
      )

      return APIResponse.success(res, 'Save file successfully')
    } catch (err) {
      return next(err)
    }
  }
}

export default new BlogDirectoryController()
