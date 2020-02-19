import fs from 'fs'
import path from 'path'
import util from 'util'
import httpStatus from 'http-status'
import BlogUITemplate from '../lib/blog-ui-template'
import { MarkdownMetaDataObject } from './blog-directory.service'
import APIError from '../helpers/api-error'
import BlogHtmlElementTemplate from '../helpers/blog-html-element-template'
import FileDirHelpers from '../helpers/file-dir-helpers'
import constants from '../common/constants'

const writeFileAsync = util.promisify(fs.writeFile)

class TagService {
  public saveBlogLinkToTagFile(
    blogDefaultUrl: string,
    tagDirPath: string,
    htmlFileName: string,
    newBlogMeata: MarkdownMetaDataObject
  ): Promise<any> {
    const { tags, title } = newBlogMeata
    const blogLink = path.join(
      blogDefaultUrl,
      constants.HTML_DIR_NAME,
      htmlFileName
    )

    /** Check tag directory exists or not (then create one) */
    FileDirHelpers.createDirIfNotExistsOfGivenPath(tagDirPath)

    /** Create new tag file content and include new html link */
    const newTagFileContent: string = this.createNewTagFileContent(
      blogLink,
      title
    )

    return this.writeTagFileProcess(
      tags,
      tagDirPath,
      newTagFileContent,
      blogLink,
      title
    )
  }

  public createNewTagFileContent(blogLink: string, title: string) {
    let newTagFileContent: string = BlogUITemplate.getTagFileTemplate()
    const htmlLinkElement: string = BlogHtmlElementTemplate.createHomepageLinkBlock(
      blogLink,
      title
    )
    newTagFileContent = BlogUITemplate.addContentsToTemplate(
      newTagFileContent,
      [
        {
          template_sign: '{{tagTableContent}}',
          content: htmlLinkElement
        }
      ]
    )

    return newTagFileContent
  }

  public writeTagFileProcess(
    tags: Array<string>,
    tagDirPath: string,
    newTagFileContent: string,
    blogLink: string,
    title: string
  ): Promise<any> {
    /** Loop through all tags of blog
     * If tag is not exists then create file and write the link
     * If tag is exists then append new blog link
     * */
    const writeLinkToTagFileProcess = tags.map(tag => {
      const tagFilePath = path.join(tagDirPath, `${tag}.html`)
      let tagData: string = this.prepareContentForTagFile(
        tagFilePath,
        tagDirPath,
        tag,
        blogLink,
        title,
        newTagFileContent
      )

      /** Write content to tag file */
      writeFileAsync(tagFilePath, tagData, {
        encoding: 'utf-8'
      }).catch(err => {
        throw new APIError(httpStatus.BAD_REQUEST, 'Write tag file error', err)
      })
    })

    return Promise.all(writeLinkToTagFileProcess)
  }

  public prepareContentForTagFile(
    tagFilePath: string,
    tagDirPath: string,
    tag: string,
    blogLink: string,
    title: string,
    newTagFileContent: string
  ): string {
    let tagData: string
    if (!fs.existsSync(tagFilePath)) {
      /** If tag file is not exists */
      tagData = newTagFileContent
      /** Add tag name to file header */
      tagData = BlogUITemplate.addContentsToTemplate(tagData, [
        {
          template_sign: '{{tagName}}',
          content: tag
        }
      ])
    } else {
      /** If tag file is already existed */
      tagData = this.createNewContentForExistedTagFile(
        tagDirPath,
        tag,
        blogLink,
        title
      )
    }

    return tagData
  }

  public createNewContentForExistedTagFile(
    tagDirPath: string,
    tag: string,
    blogLink: string,
    title: string
  ): string {
    /** Read data of existed tag file */
    let tagData: string = fs.readFileSync(
      path.join(tagDirPath, `${tag}.html`),
      {
        encoding: 'utf-8'
      }
    )

    /** Create new blog link element */
    const newBlogLinkElement = BlogHtmlElementTemplate.createTagLinkBlock(
      blogLink,
      title
    )

    /** Append to old tag data */
    const regex = new RegExp(constants.TAG_APPEND_POINT_SIGN_REGEX)
    tagData = tagData.replace(regex, newBlogLinkElement)

    return tagData
  }

  public handleParseBlogTagsArrayToMetaData(
    blogTagsArray: Array<string>
  ): string {
    let result = 'tags:'
    for (let i = 0; i < blogTagsArray.length; i++) {
      if (i === blogTagsArray.length - 1) {
        /** If this is a last element then end the string with ; */
        result += `${blogTagsArray[i]};`
      } else {
        /** Is not a last element then separate the next element with , */
        result += `${blogTagsArray[i]},`
      }
    }

    return result
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

export default new TagService()
