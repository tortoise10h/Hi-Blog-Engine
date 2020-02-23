import fs from 'fs'
import path from 'path'
import util from 'util'
import httpStatus from 'http-status'
import moment from 'moment'
import _ from 'lodash'
import APIError from '../helpers/api-error'
import constants from '../common/constants'
import FileDirHelpers from '../helpers/file-dir-helpers'
import HtmlBlockTemplate from '../helpers/blog-html-element-template'
import BlogUITemplate from '../lib/blog-ui-template'
import { IMarkdownMetaDataObject } from '../services/html-markdown.service'
import MyArrayHelpers from '../helpers/my-array-helpers'

export interface IBlogInfoInIndexConfig {
  title: string
  date: Date
  tags: Array<string>
  publishMode: string
  blogLink: string
  fileName: string
}

class BlogIndexService {
  public async generateIndexHtmlFileWithNewBlog(
    blogRootPath: string,
    blogDefaultUrl: string,
    htmlDirPath: string,
    newFileName: string,
    newBlogMetaDatObject: IMarkdownMetaDataObject
  ) {
    try {
      const indexConfigFilePath: string = path.join(blogRootPath, 'index.json')
      const indexHtmlFilePath: string = path.join(blogRootPath, 'index.html')
      let indexConfigObject: any = this.getIndexConfigObject(
        indexConfigFilePath
      )
      const newBlogLink: string = path.join(
        blogDefaultUrl,
        constants.HTML_DIR_NAME,
        `${newFileName}.html`
      )

      /** Add new blog info to index config */
      const newBlogInfo: IBlogInfoInIndexConfig = {
        title: newBlogMetaDatObject.title,
        publishMode: newBlogMetaDatObject.publishMode,
        date: newBlogMetaDatObject.date,
        tags: newBlogMetaDatObject.tags,
        blogLink: newBlogLink,
        fileName: newFileName
      }

      indexConfigObject.blogs = this.updateBlogArrInIndexConfigCompareToCurrentHtmlDir(
        indexConfigObject.blogs,
        newBlogInfo,
        htmlDirPath
      )

      this.generateNewIndexHtmlFile(indexConfigObject.blogs, indexHtmlFilePath)

      FileDirHelpers.writeFilePromise(
        indexConfigFilePath,
        JSON.stringify(indexConfigObject)
      )
    } catch (error) {
      throw new APIError(
        httpStatus.BAD_REQUEST,
        'Generate index html file for blog error',
        error
      )
    }
  }

  public getIndexConfigObject(indexConfigFilePath: string) {
    try {
      let indexConfigObject: any = {
        blogs: []
      }
      if (FileDirHelpers.isFileExisted(indexConfigFilePath)) {
        /** If index config file is already existed then read it and replace default index config object */
        const indexConfigContent: string = fs.readFileSync(
          indexConfigFilePath,
          { encoding: 'utf-8' }
        )
        indexConfigObject = JSON.parse(indexConfigContent)
      }

      return indexConfigObject
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }

  public updateBlogArrInIndexConfigCompareToCurrentHtmlDir(
    blogInfoArr: Array<IBlogInfoInIndexConfig>,
    newBlogInfo: IBlogInfoInIndexConfig,
    htmlDirPath: string
  ): Array<IBlogInfoInIndexConfig> {
    try {
      blogInfoArr.push(newBlogInfo)

      const deletedFiles: Array<string> = this.getAllRedundantHtmlFilesInIndexConfig(
        htmlDirPath,
        blogInfoArr
      )

      /** Remove all redundant files in index config */
      blogInfoArr = blogInfoArr.filter(
        (blog: IBlogInfoInIndexConfig) =>
          !deletedFiles.includes(`${blog.fileName}.html`)
      )

      return blogInfoArr
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }

  public getAllRedundantHtmlFilesInIndexConfig(
    htmlDirPath: string,
    blogInfoArr: Array<IBlogInfoInIndexConfig>
  ) {
    try {
      const htmlDirFiles: Array<string> = fs.readdirSync(htmlDirPath)

      // Get all html files in index blog
      const htmlFilesInIndexConfig: Array<string> = blogInfoArr.map(
        (blog: IBlogInfoInIndexConfig) => blog.fileName
      )

      // get all html files exist in index config but not exist in html dir
      const deletedFiles: Array<string> = _.difference(
        htmlFilesInIndexConfig,
        htmlDirFiles
      )

      return deletedFiles
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }

  public prepareIndexHtmlTemplate(
    blogInfoArray: Array<IBlogInfoInIndexConfig>
  ): string {
    let homepageTemplate: string = BlogUITemplate.getHomepageTemplate()

    const tableOfContentData = this.createIndexHtmlTableContent(blogInfoArray)

    /** Put table of content data to template file */
    homepageTemplate = BlogUITemplate.addContentsToTemplate(homepageTemplate, [
      {
        template_sign: '{{tableContent}}',
        content: tableOfContentData
      }
    ])

    return homepageTemplate
  }

  public createIndexHtmlTableContent(
    blogInfoArray: Array<IBlogInfoInIndexConfig>
  ): string {
    let result = ''

    /** Make sure blog order ascending */
    const ascendingBlogInfoArr: Array<IBlogInfoInIndexConfig> = this.sortBlogArrByDateAscending(
      blogInfoArray
    )

    ascendingBlogInfoArr.forEach((blogInfoObject: IBlogInfoInIndexConfig) => {
      const blogLinkElement = HtmlBlockTemplate.createHomePageBlogLink(
        blogInfoObject.blogLink,
        blogInfoObject.title
      )

      result += blogLinkElement
    })

    return result
  }

  public sortBlogArrByDateAscending(
    blogInfoArray: Array<IBlogInfoInIndexConfig>
  ): Array<IBlogInfoInIndexConfig> {
    const result = blogInfoArray.sort(
      (a: IBlogInfoInIndexConfig, b: IBlogInfoInIndexConfig) => {
        return MyArrayHelpers.compareDateInSortByDateAsc(a.date, b.date)
      }
    )

    return result
  }

  public generateNewIndexHtmlFile(
    blogInfoArr: Array<IBlogInfoInIndexConfig>,
    indexHtmlFilePath: string
  ) {
    try {
      const homePageHtmlContent: string = this.prepareIndexHtmlTemplate(
        blogInfoArr
      )

      FileDirHelpers.writeFilePromise(indexHtmlFilePath, homePageHtmlContent)
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }

  public async updateBlogInfoInIndexConfigFile(
    blogInfoObject: IBlogInfoInIndexConfig,
    blogRootPath: string
  ) {
    try {
      const indexConfigFilePath: string = path.join(blogRootPath, 'index.json')
      const indexConfigContent: string = fs.readFileSync(indexConfigFilePath, {
        encoding: 'utf-8'
      })
      const indexConfigObject: any = JSON.parse(indexConfigContent)

      /** Update new info for chosen blog */
      indexConfigObject.blogs = this.updateBlogInBlogArrOfIndexConfig(
        indexConfigObject.blogs,
        blogInfoObject
      )

      await FileDirHelpers.writeFilePromise(
        indexConfigFilePath,
        JSON.stringify(indexConfigObject)
      )
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }

  public updateBlogInBlogArrOfIndexConfig(
    blogInfoArray: Array<IBlogInfoInIndexConfig>,
    blogInfoObject: IBlogInfoInIndexConfig
  ): Array<IBlogInfoInIndexConfig> {
    try {
      const updatePosition: number = blogInfoArray.findIndex(
        val => val.blogLink === blogInfoObject.blogLink
      )

      blogInfoArray[updatePosition] = {
        ...blogInfoObject
      }

      return blogInfoArray
    } catch (error) {
      throw new APIError(httpStatus.BAD_REQUEST, '', error)
    }
  }
}

export default new BlogIndexService()
