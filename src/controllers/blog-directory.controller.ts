import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status'
import fs from 'fs'
import util from 'util'
import path from 'path'
import FileDirHelpers from '../helpers/file-dir-helpers'
import BlogDirectoryService from '../services/blog-directory.service'
import BlogIndexService from '../services/blog-index.service'
import { IMarkdownMetaDataObject } from '../services/html-markdown.service'
import { IBlogInfoInIndexConfig } from '../services/blog-index.service'
import APIError from '../helpers/api-error'
import APIResponse from '../helpers/api-response'
import constants from '../common/constants'

class BlogDirectoryController {
  private readonly markdownDirPath: string
  private readonly htmlDirPath: string
  private readonly blogRootPath: string
  private readonly blogDefaultUrl: string
  private readonly tagUrl: string

  constructor(
    blogRootPath: string,
    blogDefaultUrl: string,
    markdownDirPath: string,
    htmlDirPath: string,
    tagUrl: string
  ) {
    this.blogRootPath = blogRootPath
    this.blogDefaultUrl = blogDefaultUrl
    this.markdownDirPath = markdownDirPath
    this.htmlDirPath = htmlDirPath
    this.tagUrl = tagUrl
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
      let rootDir: Array<string> = fs.readdirSync(this.markdownDirPath)
      const privateMarkdownDirPath: string = path.join(
        this.blogRootPath,
        constants.PRIVATE_DIR_NAME,
        constants.MARKDOWN_DIR_NAME
      )
      FileDirHelpers.createDirIfNotExistsOfGivenPath(privateMarkdownDirPath)
      const privateMarkdownFiles: Array<string> = fs.readdirSync(
        privateMarkdownDirPath
      )

      rootDir = [...rootDir, ...privateMarkdownFiles]

      /** Sort by alphabet ascending */
      rootDir.sort()

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

  public async generateIndexHtmlFileWithNewBlog(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        newFileName,
        metaDataObject,
        minRead
      }: {
        newFileName: string
        metaDataObject: IMarkdownMetaDataObject
        minRead: number
      } = req

      await BlogIndexService.generateIndexHtmlFileWithNewBlog(
        this.blogRootPath,
        this.blogDefaultUrl,
        this.htmlDirPath,
        newFileName,
        metaDataObject,
        minRead,
        this.tagUrl
      )

      return APIResponse.success(res, 'Save file successfully')
    } catch (err) {
      return next(err)
    }
  }

  public async updateIndexHtmlAfterUpdateBlog(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        newBlogMetaDatObject,
        htmlFile,
        minRead
      }: {
        newBlogMetaDatObject: IMarkdownMetaDataObject
        htmlFile: string
        minRead: number
      } = req

      const htmlFileName = FileDirHelpers.changeFileExtension(
        htmlFile,
        '.html',
        ''
      )

      const blogInfoObject: IBlogInfoInIndexConfig = {
        ...newBlogMetaDatObject,
        blogLink: htmlFile,
        fileName: htmlFileName,
        minRead
      }

      await BlogIndexService.updateBlogInfoInIndexConfigFile(
        blogInfoObject,
        this.blogRootPath
      )

      /** After update newest index config file then generate new index html file */
      const indexHtmlFilePath = path.join(this.blogRootPath, 'index.html')
      const indexConfigFilePath = path.join(this.blogRootPath, 'index.json')
      const indexConfigContent = fs.readFileSync(indexConfigFilePath, {
        encoding: 'utf-8'
      })
      const indexConfigObject = JSON.parse(indexConfigContent)

      BlogIndexService.generateNewIndexHtmlFile(
        indexConfigObject.blogs,
        indexHtmlFilePath,
        this.tagUrl
      )
      return APIResponse.success(res, 'Edit blog successfully')
    } catch (error) {
      return next(error)
    }
  }

  public async removeDeletedBlogLinkFromIndexFile(
    req: any,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { blogLink }: { blogLink: string } = req
      const indexConfigFilePath = path.join(this.blogRootPath, 'index.json')
      const indexHtmlFilePath = path.join(this.blogRootPath, 'index.html')

      await BlogIndexService.removeBlogLinkFromIndexFile(
        blogLink,
        indexConfigFilePath,
        indexHtmlFilePath,
        this.tagUrl
      )

      return APIResponse.success(res, 'Delete blog successfully')
    } catch (error) {
      return next(error)
    }
  }

  public renderWritingPage(req: any, res: Response, next: NextFunction) {
    try {
      const { rootDir } = req

      res.render('editor', {
        rootDir
      })
    } catch (error) {
      return next(error)
    }
  }
}

export default BlogDirectoryController
