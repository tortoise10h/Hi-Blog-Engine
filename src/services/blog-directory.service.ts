import fs from 'fs'
import MyMarkdownit from '../lib/markdownit'
import path from 'path'
import util from 'util'
import _ from 'lodash'
import momentTimezone from 'moment-timezone'
import httpStatus from 'http-status'
import APIError from '../helpers/api-error'
import constants from '../common/constants'
import FileDirHelpers from '../helpers/file-dir-helpers'
import BlogUITemplate from '../lib/blog-ui-template'
import HtmlBlockTemplate from '../helpers/blog-html-element-template'
import MyArrayHelpers from '../helpers/my-array-helpers'
import TagService from '../services/tag.service'

const writeFile = util.promisify(fs.writeFile)

interface HtmlandMarkdownPathsReturn {
  htmlPath: string
  markdownPath: string
}

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

  public createHtmlandMarkdownPaths(
    fileName: string
  ): HtmlandMarkdownPathsReturn {
    const htmlPath = `${process.env.SERVER_BLOG_DIRECTORY}/${constants.HTML_DIR_NAME}/${fileName}.html`
    const markdownPath = `${process.env.SERVER_BLOG_DIRECTORY}/${constants.MARKDOWN_DIR_NAME}/${fileName}.md`
    return {
      htmlPath,
      markdownPath
    }
  }

  public saveMarkdownandHtmlFileProcess(
    fileName: string,
    htmlContent: string,
    markdownContent: string,
    blogTagsArray: Array<string>,
    blogTitle: string,
    blogPublishMode: string,
    blogDate: Date
  ): Promise<any> {
    /** Append meta data to markdown content */
    markdownContent += this.createMarkdownFileMetaData(
      blogDate,
      blogTitle,
      blogTagsArray,
      blogPublishMode
    )

    /** Create html and markdown file path */
    const { htmlPath, markdownPath } = this.createHtmlandMarkdownPaths(fileName)

    /** If the directory that contain both html and markdown file does not exists then create them */
    FileDirHelpers.createDirIfNotExistsOfGivenPath(htmlPath)
    FileDirHelpers.createDirIfNotExistsOfGivenPath(markdownPath)

    /** Write html and markdown file down */
    const saveMarkdownandHtmlFilePromise = new Promise(resolve => {
      writeFile(htmlPath, htmlContent)
        .then(() =>
          resolve({
            isOk: true,
            message: `Save html file: ${htmlPath} successfully`
          })
        )
        .catch(err => {
          console.log('[ERROR] ==========> Save html file error ', err)
          throw new APIError(httpStatus.BAD_REQUEST, '', err)
        })

      writeFile(markdownPath, markdownContent)
        .then(() => {
          resolve({
            isOk: true,
            message: `Save html file: ${htmlPath} successfully`
          })
        })
        .catch(err => {
          console.log('[ERROR] ==========> Save markdown file error ', err)
          throw new APIError(httpStatus.BAD_REQUEST, '', err)
        })
    })

    return Promise.resolve(saveMarkdownandHtmlFilePromise)
  }

  public createMarkdownFileMetaData(
    blogDate: Date,
    blogTitle: string,
    blogTagsArray: Array<string>,
    blogPublishMode: string
  ): string {
    /** The result of meta data will be like (but without \n, just make the example looks better)
     * <<<<<Blog-Meta-Data>>>>>
     * title:some title;
     * publishMode:publish;
     * tags:javascript,vim,emacs;
     * date:2020-02-12 20:10:22;
     * */
    let metaDataContent = `\r\n${constants.BLOG_META_DATA_SIGNAL}\r\n`
    metaDataContent += `title:${blogTitle};`
    metaDataContent += `publishMode:${blogPublishMode};`
    metaDataContent += TagService.handleParseBlogTagsArrayToMetaData(
      blogTagsArray
    )

    const dateString = momentTimezone(blogDate)
      .tz(constants.TIME_ZONE_LOCATION)
      .format('YYYY/MM/DD HH:mm:ss')
    metaDataContent += `date:${dateString};`

    return metaDataContent
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
          const htmlData = this.parseMarkdownFileToHtml(
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

  public parseMarkdownFileToHtml(
    markdownFilePath: string,
    markdownConverter: any
  ): string {
    /** Read markdown data from markdown file */
    let markdownData = fs.readFileSync(markdownFilePath, {
      encoding: 'utf-8'
    })

    /** Remove meta data of markdown file to parse to html */
    markdownData = this.getMarkdownContentWithoutMetaData(markdownData)

    /** Convert markdown data to html */
    const htmlData = markdownConverter.render(markdownData)

    return htmlData
  }

  public async generateIndexHtmlFile(
    blogRootPath: string,
    blogDefaultUrl: string,
    htmlDirPath: string,
    markdownDirPath: string
  ) {
    const htmlDirFiles = fs.readdirSync(htmlDirPath)

    let homepageTemplate: string = this.prepareIndexHtmlTemplate(
      htmlDirFiles,
      markdownDirPath,
      blogDefaultUrl
    )

    const indexHtmlPath = path.join(blogRootPath, 'index.html')

    /** Return a promise to each error and controller to use next to handle error prevent app crash */
    return writeFile(indexHtmlPath, homepageTemplate, {
      encoding: 'utf-8'
    }).catch(err => {
      console.log(
        '[ERROR] =============> Generate index html file for blog error :> ',
        err
      )
      throw new APIError(
        httpStatus.BAD_REQUEST,
        'Generate index html file for blog error',
        err
      )
    })
  }

  public prepareIndexHtmlTemplate(
    htmlDirFiles: Array<string>,
    markdownDirPath: string,
    blogDefaultUrl: string
  ): string {
    let homepageTemplate: string = BlogUITemplate.getHomepageTemplate()

    /** Make html link tag for all file in html directory */
    const tableOfContentData = this.createHtmlLinkTagForEachFile(
      htmlDirFiles,
      markdownDirPath,
      blogDefaultUrl
    )

    /** Put table of content data to template file */
    homepageTemplate = homepageTemplate.replace(
      /\B{{tableContent}}\B/g,
      tableOfContentData
    )

    return homepageTemplate
  }

  public createHtmlLinkTagForEachFile(
    htmlDirFiles: any,
    markdownDirPath: string,
    blogDefaultUrl: string
  ): string {
    let result = ''

    htmlDirFiles.forEach((file: string) => {
      const htmlFileHref = path.join(
        blogDefaultUrl,
        constants.HTML_DIR_NAME,
        file
      )

      /** Get meta data from markdown file to create detail of link */
      const markdownFile = FileDirHelpers.changeFileExtension(
        file,
        '.html',
        '.md'
      )
      const { title } = this.getMarkdownMetaData(
        path.join(markdownDirPath, markdownFile)
      )

      /** Create link element */
      const htmlLinkTag = HtmlBlockTemplate.createHomepageLinkBlock(
        htmlFileHref,
        title
      )
      result += htmlLinkTag
    })

    return result
  }

  public getMarkdownContentWithoutMetaData(markdownContent: string): string {
    const result: string = markdownContent.slice(
      0,
      markdownContent.search(constants.BLOG_META_DATA_SIGNAL)
    )
    return result
  }

  public getMarkdownMetaData(markdownFilePath: string): MarkdownMetaDataObject {
    /** Get markdown content from file */
    const markdownContent = fs.readFileSync(markdownFilePath, {
      encoding: 'utf-8'
    })

    let metaDataString = this.getMarkdownMetaDatStringPart(markdownContent)
    metaDataString = metaDataString.trim()

    const metaDataObject: MarkdownMetaDataObject = this.convertMetaDataStringToObject(
      metaDataString
    )

    return metaDataObject
  }

  public convertMetaDataStringToObject(
    metaDataString: string
  ): MarkdownMetaDataObject {
    let metaDataObject: MarkdownMetaDataObject = {
      title: '',
      date: new Date(),
      tags: [''],
      publishMode: ''
    }
    let metaDataArray = metaDataString.split(';')

    metaDataArray = MyArrayHelpers.removeSpaceandEmptyElementInArrayString(
      metaDataArray
    )

    /** Convert meta data string in markdown file to object value */
    metaDataArray.forEach(value => {
      /** Ex: title:How do I get job => [0]: title [1]: How do I get job */
      /** Just split first :
       * to prevent the case of date property date:2020/02/16 20:20:20  (more than one :)
       * */
      let metaValueArray = value.split(/:(.+)/)

      metaValueArray = MyArrayHelpers.removeSpaceandEmptyElementInArrayString(
        metaValueArray
      )

      /** Make sure only get correct field */
      switch (metaValueArray[0]) {
        /** Title and publishMode are only string value then just put them in object key & value the same way */
        case 'title':
        case 'publishMode': {
          metaDataObject[metaValueArray[0]] = metaValueArray[1]
          break
        }
        case 'date': {
          /** Parse date string from meta data to Date() type */
          const blogDate = new Date(metaValueArray[1])
          metaDataObject.date = blogDate
          break
        }
        case 'tags': {
          const blogTagsArray = this.parseBlogTagsStringToArray(
            metaValueArray[1]
          )
          metaDataObject.tags = blogTagsArray
          break
        }
        default:
          break
      }
    })

    return metaDataObject
  }

  public getMarkdownMetaDatStringPart(markdownContent: string): string {
    /** Get meta data part of markdown file
     * start by constants.BLOG_META_DATA_SIGNAL then we will cut from that position
     * */
    let metaDataString: string = markdownContent.slice(
      markdownContent.search(constants.BLOG_META_DATA_SIGNAL)
    )

    /** Remove meta data signal */
    metaDataString = metaDataString.replace(
      `${constants.BLOG_META_DATA_SIGNAL}\r\n`,
      ''
    )

    return metaDataString
  }

  public parseBlogTagsStringToArray(blogTagsString: string): Array<string> {
    let blogTagsArray = blogTagsString.split(',')

    /** Blank space element will be remove */
    blogTagsArray = blogTagsArray
      .filter(tag => {
        return /\w+/.test(tag)
      })
      .map(tag => tag.trim())

    return blogTagsArray
  }
}

export default new BlogDirectoryService()
