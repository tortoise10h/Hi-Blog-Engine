import fs from 'fs'
import path from 'path'
import util from 'util'
import httpStatus from 'http-status'
import moment from 'moment'
import APIError from '../helpers/api-error'
import constants from '../common/constants'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlBlockTemplate from '../helpers/blog-html-element-template'
import BlogUITemplate from '../lib/blog-ui-template'
import HtmlAndMarkdownService from '../services/html-markdown.service'

const writeFileAsync = util.promisify(fs.writeFile)

interface IFileDataToCreateHtmlLinkElement {
  title: string
  htmlFileHref: string
}

interface IBlogObject {
  htmlFile: string
  date: Date
  title: string
  tags: Array<string>
  publishMode: string
}

class BlogIndexService {
  public async generateIndexHtmlFile(
    blogRootPath: string,
    blogDefaultUrl: string,
    htmlDirPath: string,
    markdownDirPath: string
  ) {
    try {
      const htmlDirFiles = fs.readdirSync(htmlDirPath)
      const blogObjectArrWithMetaData: Array<IBlogObject> = this.getBlogObjectArrayWithMetaData(
        htmlDirFiles,
        markdownDirPath
      )

      let homepageTemplate: string = this.prepareIndexHtmlTemplate(
        blogObjectArrWithMetaData,
        markdownDirPath,
        blogDefaultUrl
      )

      const indexHtmlPath = path.join(blogRootPath, 'index.html')

      /** Return a promise to each error and controller to use next to handle error prevent app crash */
      return writeFileAsync(indexHtmlPath, homepageTemplate, {
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
    } catch (error) {
      throw new APIError(
        httpStatus.BAD_REQUEST,
        'Generate index html file for blog error',
        error
      )
    }
  }

  public getBlogObjectArrayWithMetaData(
    htmlFiles: Array<string>,
    markdownDirPath: string
  ): Array<IBlogObject> {
    const blogObjectArrWithMetaData: Array<IBlogObject> = htmlFiles.map(
      htmlFile => {
        const markdownFileName = FileDirHelpers.changeFileExtension(
          htmlFile,
          '.html',
          '.md'
        )
        const metaDataObject = HtmlAndMarkdownService.getMarkdownMetaData(
          path.join(markdownDirPath, markdownFileName)
        )

        return {
          htmlFile,
          ...metaDataObject
        }
      }
    )

    return blogObjectArrWithMetaData
  }

  public prepareIndexHtmlTemplate(
    blogObjectArrWithMetaData: Array<IBlogObject>,
    markdownDirPath: string,
    blogDefaultUrl: string
  ): string {
    let homepageTemplate: string = BlogUITemplate.getHomepageTemplate()

    /** Make html link tag for all file in html directory */
    const tableOfContentData = this.createHtmlLinkElementForEachFile(
      blogObjectArrWithMetaData,
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

  public createHtmlLinkElementForEachFile(
    blogObjectArrWithMetaData: Array<IBlogObject>,
    markdownDirPath: string,
    blogDefaultUrl: string
  ): string {
    let result = ''

    const blogArr: Array<IBlogObject> = this.sortBlogArrByDateAscending(
      blogObjectArrWithMetaData
    )

    blogArr.forEach((blogObject: IBlogObject) => {
      const {
        htmlFileHref,
        title
      }: IFileDataToCreateHtmlLinkElement = this.preapreFileDataToCreateHtmlLinkElement(
        blogDefaultUrl,
        blogObject,
        markdownDirPath
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

  public preapreFileDataToCreateHtmlLinkElement(
    blogDefaultUrl: string,
    blogObject: IBlogObject,
    markdownDirPath: string
  ): IFileDataToCreateHtmlLinkElement {
    /** Href link to put to <a> tag */
    const htmlFileHref = path.join(
      blogDefaultUrl,
      constants.HTML_DIR_NAME,
      blogObject.htmlFile
    )

    /** Get meta data from markdown file to create detail of link */
    const markdownFile = FileDirHelpers.changeFileExtension(
      blogObject.htmlFile,
      '.html',
      '.md'
    )
    const { title } = HtmlAndMarkdownService.getMarkdownMetaData(
      path.join(markdownDirPath, markdownFile)
    )

    return {
      title,
      htmlFileHref
    }
  }

  public sortBlogArrByDateAscending(
    blogObjectArrWithMetaData: Array<IBlogObject>
  ): Array<IBlogObject> {
    const result = blogObjectArrWithMetaData.sort(
      (a: IBlogObject, b: IBlogObject) => {
        if (moment(a.date).isAfter(moment(b.date))) {
          return 1
        } else if (moment(a.date).isBefore(moment(b.date))) {
          return -1
        } else {
          return 0
        }
      }
    )

    return result
  }
}

export default new BlogIndexService()
