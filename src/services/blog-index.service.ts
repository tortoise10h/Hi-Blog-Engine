import fs from 'fs'
import path from 'path'
import util from 'util'
import httpStatus from 'http-status'
import APIError from '../helpers/api-error'
import constants from '../common/constants'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlBlockTemplate from '../helpers/blog-html-element-template'
import BlogUITemplate from '../lib/blog-ui-template'

const writeFileAsync = util.promisify(fs.writeFile)

class BlogIndexService {
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
}

export default new BlogIndexService()
