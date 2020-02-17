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
class HtmlMarkdownService {
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
}

export default new HtmlMarkdownService()
