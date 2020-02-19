import fs from 'fs'
import MyMarkdownit from '../lib/markdownit'
import path from 'path'
import util from 'util'
import _ from 'lodash'
import httpStatus from 'http-status'
import APIError from '../helpers/api-error'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlAndMarkdownService from '../services/html-markdown.service'

const writeFile = util.promisify(fs.writeFile)

interface ValidBlogDirectoryCheckerReturn {
  isOk: boolean
  message: string
}

interface SingleFileMissingObject {
  htmlPath: string
  markdownPath: string
}

export interface MarkdownMetaDataObject {
  title: string
  publishMode: string
  date: Date
  tags: Array<string>
}

interface IGetAllFileNamesOfHtmlDirAndMarkdownDirReturn {
  htmlDirFilesNoExtension: Array<string>
  markdownDirFilesNoExtension: Array<string>
}

class BlogDirectoryService {
  public isBlogDirectoryValid(
    rootDirPath: string
  ): ValidBlogDirectoryCheckerReturn {
    if (!FileDirHelpers.isDirectoryExisted(rootDirPath)) {
      return {
        isOk: false,
        message:
          'Your root blog directory path does not exist. Please create it or edit root blog directory path in .env file at SERVER_BLOG_DIRECTORY field'
      }
    }

    return {
      isOk: true,
      message: ''
    }
  }

  public async createMissingFilesInHtmlDirFromMarkdownDir(
    markdownDirPath: string,
    htmlDirPath: string
  ): Promise<any> {
    try {
      /** Find missing files inside html directory compare to markdown directory */
      const missingFilesPathList: Array<SingleFileMissingObject> = this.findMissingFilesInHtmlDir(
        markdownDirPath,
        htmlDirPath
      )

      /** Create all missing files of html directory */
      return this.createHtmlDirMissingFilesProcess(missingFilesPathList)
    } catch (error) {
      throw new APIError(
        httpStatus.BAD_REQUEST,
        'Create missing file in html directory from markdown directory ERROR',
        error
      )
    }
  }

  public findMissingFilesInHtmlDir(
    markdownDirPath: string,
    htmlDirPath: string
  ): Array<SingleFileMissingObject> {
    const {
      htmlDirFilesNoExtension,
      markdownDirFilesNoExtension
    } = this.getAllFileNamesOfMarkdownAndHtmlDir(htmlDirPath, markdownDirPath)

    /** Get missing files in html directory compare to markdown directory */
    const differentFiles: Array<string> = _.difference(
      markdownDirFilesNoExtension,
      htmlDirFilesNoExtension
    )

    /** Create missing file object for each missing file */
    const fileMissingObjectArray: Array<SingleFileMissingObject> = this.createArrayFullPathOfFileMissingObject(
      differentFiles,
      htmlDirPath,
      markdownDirPath
    )

    return fileMissingObjectArray
  }

  public getAllFileNamesOfMarkdownAndHtmlDir(
    htmlDirPath: string,
    markdownDirPath: string
  ): IGetAllFileNamesOfHtmlDirAndMarkdownDirReturn {
    /** Get files in html dir and markdown dir */
    const htmlDirFiles = fs.readdirSync(htmlDirPath)
    const markdownDirFiles = fs.readdirSync(markdownDirPath)

    /** Remove extension of files in markdown dir and files in html dir to compare */
    const htmlDirFilesNoExtension = FileDirHelpers.removeArrayFileExtension(
      htmlDirFiles,
      '.html'
    )
    const markdownDirFilesNoExtension = FileDirHelpers.removeArrayFileExtension(
      markdownDirFiles,
      '.md'
    )

    return {
      htmlDirFilesNoExtension,
      markdownDirFilesNoExtension
    }
  }

  public createArrayFullPathOfFileMissingObject(
    differentFiles: Array<string>,
    htmlDirPath: string,
    markdownDirPath: string
  ): Array<SingleFileMissingObject> {
    const fileMissingObjectArray: Array<SingleFileMissingObject> = []

    /** Loop through different files name array to make full path of both markdown file and html file */
    differentFiles.forEach(differentFile => {
      const markdownPath = path.join(markdownDirPath, `${differentFile}.md`)
      const htmlPath = path.join(htmlDirPath, `${differentFile}.html`)

      fileMissingObjectArray.push({
        htmlPath,
        markdownPath
      })
    })

    return fileMissingObjectArray
  }

  public createHtmlDirMissingFilesProcess(
    fileMissingObjectArray: Array<SingleFileMissingObject>
  ): Promise<any> {
    /** Create promise of create single file to apply to all missing file in array missingFilesPath */
    const createSingMissingFile = (missingFilePath: SingleFileMissingObject) =>
      new Promise(async (resolve, reject) => {
        try {
          const markdownConverter = MyMarkdownit.getMarkdownitConverter()

          /** Get html data */
          const htmlData = HtmlAndMarkdownService.parseMarkdownFileToHtml(
            missingFilePath.markdownPath,
            markdownConverter
          )

          /** Create missing html file */
          writeFile(missingFilePath.htmlPath, htmlData)
            .then(() =>
              resolve({
                isOk: true,
                message: `created ${missingFilePath.htmlPath} successfully`
              })
            )
            .catch(err => {
              console.log(
                '[ERROR] =============> create missing file error ',
                err
              )
              reject(err)
            })
        } catch (error) {
          throw new APIError(httpStatus.BAD_REQUEST, '', error)
        }
      })

    return Promise.all(
      fileMissingObjectArray.map(fileMissingObject =>
        createSingMissingFile(fileMissingObject)
      )
    )
  }
}

export default new BlogDirectoryService()
