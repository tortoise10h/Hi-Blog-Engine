import fs from 'fs'
import path from 'path'
import httpStatus from 'http-status'
import util from 'util'
import _ from 'lodash'
import constants from '../common/constants'
import APIError from '../helpers/api-error'

const mkdirAsync = util.promisify(fs.mkdir)
const writeFileAsync = util.promisify(fs.writeFile)
const unlinkAsync = util.promisify(fs.unlink)

interface ValidBlogDirectoryCheckerReturn {
  isOk: boolean
  message: string
}

class FileDirHelpers {
  public createDirIfNotExistsOfGivenPath(path: string): void {
    const pathWithoutParentDir = path.replace(
      `${process.env.SERVER_BLOG_DIRECTORY}`,
      ''
    )
    const dirArr = pathWithoutParentDir.split('/')
    let checkedPath = `${process.env.SERVER_BLOG_DIRECTORY}`
    dirArr.forEach(dir => {
      if (
        dir &&
        dir !== '' &&
        dir.indexOf('.') === -1 &&
        !fs.existsSync(`${checkedPath}/${dir}`)
      ) {
        fs.mkdirSync(`${checkedPath}/${dir}`)
      }

      checkedPath += `/${dir}`
    })
  }

  public createDirectoryIfNotExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath)
    }
  }

  public isFileExisted(path: string): boolean {
    try {
      if (fs.existsSync(path)) {
        return true
      }
      return false
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }

  public isDirectoryExisted(dirPath: string): boolean {
    if (fs.existsSync(dirPath)) {
      return true
    }
    return false
  }

  public createSubDirsOfFirstDirFromSecondDirProcess(
    firstDirPath: string,
    secondDirPath: string
  ) {
    /** Read all sub directories of two directories */
    const subDirsOfFirstDir = fs.readdirSync(firstDirPath)
    const subDirsOfSecondDir = fs.readdirSync(secondDirPath)

    /** Get missing dirs of first dir from second dir and create their path by attach first dir path */
    let missingSubDirs = _.difference(
      subDirsOfSecondDir,
      subDirsOfFirstDir
    ).map(subDir => path.join(firstDirPath, subDir))

    /** Create single dir promise to apply on all array dir */
    const createSingleSubDir = (singleDirPath: string) =>
      new Promise((resolve, reject) => {
        mkdirAsync(singleDirPath)
          .then(() =>
            resolve({
              isOk: true,
              message: `create ${singleDirPath} successfully`
            })
          )
          .catch(err => {
            reject(err)
            console.log(
              '[ERROR] =============> create missing file error ',
              err
            )
          })
      })

    return Promise.all(
      missingSubDirs.map((subDirPath: string) => createSingleSubDir(subDirPath))
    )
  }

  public changeFileExtension(
    filePath: string,
    oldExtension: string,
    newExtension: string
  ): string {
    const regex = new RegExp(`${oldExtension}$`)
    const newFilePath = filePath.replace(regex, `${newExtension}`)
    return newFilePath
  }

  public removeArrayFileExtension(
    arrFile: Array<string>,
    extension: string
  ): Array<string> {
    arrFile = arrFile.map(file => {
      return this.changeFileExtension(file, extension, '')
    })

    return arrFile
  }

  public writeFilePromise(filePath: string, data: string): Promise<any> {
    try {
      return new Promise(resolve => {
        writeFileAsync(filePath, data, { encoding: 'utf-8' })
          .then(() => resolve({ isOk: 'ok' }))
          .catch(err => {
            throw new APIError(httpStatus.BAD_REQUEST, '', err)
          })
      })
    } catch (error) {
      throw error
    }
  }

  public isFilePrivate(blogRootPath: string, markdownFile: string): boolean {
    try {
      const pathInPrivateDir: string = path.join(
        blogRootPath,
        constants.PRIVATE_DIR_NAME,
        constants.MARKDOWN_DIR_NAME,
        markdownFile
      )

      if (this.isFileExisted(pathInPrivateDir)) {
        return true
      }
      return false
    } catch (error) {
      throw error
    }
  }

  public getOldBlogHtmlAndMarkdownPath(
    markdownFile: string,
    blogRootPath: string
  ) {
    try {
      const markdownFilePath: string = path.join(
        blogRootPath,
        constants.MARKDOWN_DIR_NAME,
        markdownFile
      )
      const htmlFile = this.changeFileExtension(markdownFile, '.md', '.html')

      if (this.isFileExisted(markdownFilePath)) {
        // if file is existed that mean publish mode of file is not private
        return {
          markdownFilePath,
          htmlFilePath: path.join(
            blogRootPath,
            constants.HTML_DIR_NAME,
            htmlFile
          )
        }
      }

      // if pass if statement above that's mean publish mode is private
      return {
        markdownFilePath: path.join(
          blogRootPath,
          constants.PRIVATE_DIR_NAME,
          constants.MARKDOWN_DIR_NAME,
          markdownFile
        ),
        htmlFilePath: path.join(
          blogRootPath,
          constants.PRIVATE_DIR_NAME,
          constants.HTML_DIR_NAME,
          htmlFile
        )
      }
    } catch (error) {
      throw error
    }
  }

  public createHtmlAndMarkdownFilePathByPublishMode(
    publishMode: string,
    blogRootPath: string,
    markdownFile: string,
    htmlFile: string
  ) {
    try {
      let markdownFilePath: string = ''
      let htmlFilePath: string = ''

      if (publishMode === constants.PUBLISH_MODES.PRIVATE) {
        // if publish mode is private then create file location inside private folder
        markdownFilePath = path.join(
          blogRootPath,
          constants.PRIVATE_DIR_NAME,
          constants.MARKDOWN_DIR_NAME,
          markdownFile
        )
        htmlFilePath = path.join(
          blogRootPath,
          constants.PRIVATE_DIR_NAME,
          constants.HTML_DIR_NAME,
          htmlFile
        )
      } else {
        // different private then just locate file in normal directory
        markdownFilePath = path.join(
          blogRootPath,
          constants.MARKDOWN_DIR_NAME,
          markdownFile
        )
        htmlFilePath = path.join(
          blogRootPath,
          constants.HTML_DIR_NAME,
          htmlFile
        )
      }

      return {
        markdownFilePath,
        htmlFilePath
      }
    } catch (error) {
      throw error
    }
  }

  public removeFilePromise(filePath: string) {
    try {
      return new Promise(resolve => {
        unlinkAsync(filePath)
          .then(() => resolve({ isOk: 'ok' }))
          .catch(err => {
            throw err
          })
      })
    } catch (error) {
      throw error
    }
  }
}

export default new FileDirHelpers()
