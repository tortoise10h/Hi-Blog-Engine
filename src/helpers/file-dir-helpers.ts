import fs from 'fs'
import path from 'path'
import httpStatus from 'http-status'
import util from 'util'
import _ from 'lodash'
import APIError from '../helpers/api-error'

const mkdirAsync = util.promisify(fs.mkdir)

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
}

export default new FileDirHelpers()
