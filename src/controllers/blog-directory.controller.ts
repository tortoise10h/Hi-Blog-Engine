import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import fs from 'fs'
import FileDirHelpers from '../helpers/file-dir-helpers'
import BlogDirectoryService from '../services/blog-directory.service'
import BlogIndexService from '../services/blog-index.service'
import APIError from '../helpers/api-error'
import APIResponse from '../helpers/api-response'

class BlogDirectoryController {
  private readonly markdownDirPath: string
  private readonly htmlDirPath: string
  private readonly blogRootPath: string
  private readonly blogDefaultUrl: string

  constructor(
    blogRootPath: string,
    blogDefaultUrl: string,
    markdownDirPath: string,
    htmlDirPath: string
  ) {
    this.blogRootPath = blogRootPath
    this.blogDefaultUrl = blogDefaultUrl
    this.markdownDirPath = markdownDirPath
    this.htmlDirPath = htmlDirPath
  }

  public async checkValidRootBlogDirectory(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      /** Check valid root blog dir path */
      const { isOk, message } = BlogDirectoryService.isBlogDirectoryValid(
        this.blogRootPath
      )
      if (!isOk) {
        return next(new APIError(httpStatus.BAD_REQUEST, message))
      }

      /** Check markdown directory and create if is doesn't exist */
      FileDirHelpers.createDirectoryIfNotExists(this.markdownDirPath)

      return next()
    } catch (err) {
      return next(err)
    }
  }

  public getAllMarkdownFiles(req: any, res: Response, next: NextFunction) {
    try {
      const rootDir = fs.readdirSync(this.markdownDirPath)

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
      await BlogDirectoryService.createMissingFilesInHtmlDirFromMarkdownDir(
        this.markdownDirPath,
        this.htmlDirPath
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
      await BlogIndexService.generateIndexHtmlFile(
        this.blogRootPath,
        this.blogDefaultUrl,
        this.htmlDirPath,
        this.markdownDirPath
      )

      return APIResponse.success(res, 'Save file successfully')
    } catch (err) {
      return next(err)
    }
  }
}

export default BlogDirectoryController
