import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import util from 'util'
import httpStatus from 'http-status'
import BlogUITemplate from '../lib/blog-ui-template'
import { IMarkdownMetaDataObject } from './html-markdown.service'
import APIError from '../helpers/api-error'
import BlogHtmlElementTemplate from '../helpers/blog-html-element-template'
import FileDirHelpers from '../helpers/file-dir-helpers'
import MyArrayHelpers from '../helpers/my-array-helpers'
import MyCustomHelpers from '../helpers/my-custom-helpers'
import constants from '../common/constants'

interface IBlogConfigInTag {
  date: Date
  title: string
  blogLink: string
  publishMode: string
}

interface ITagTypeOfBlogEdit {
  newTags: Array<string>
  oldTags: Array<string>
  stableTags: Array<string>
}

class TagService {
  public saveNewBlogLinkToTags(
    blogDefaultUrl: string,
    tagDirPath: string,
    htmlFileName: string,
    newBlogMeata: IMarkdownMetaDataObject
  ): Promise<any> {
    try {
      const { tags, title, date, publishMode } = newBlogMeata
      const blogLink = path.join(
        blogDefaultUrl,
        constants.HTML_DIR_NAME,
        htmlFileName
      )

      return this.writeNewBlogLinkToTagsProcess(
        tags,
        tagDirPath,
        blogLink,
        title,
        date,
        publishMode
      )
    } catch (error) {
      throw error
    }
  }

  public writeNewBlogLinkToTagsProcess(
    tags: Array<string>,
    tagDirPath: string,
    blogLink: string,
    title: string,
    date: Date,
    publishMode: string
  ): Promise<any> {
    try {
      /** Loop through all tags of blog
       * If tag is not exists then create file and write the link
       * If tag is exists then append new blog link
       * */
      const writeLinkToTagFileProcess = tags.map(tag => {
        const tagFilePath = path.join(
          tagDirPath,
          constants.TAG_HTML_DIR_NAME,
          `${tag}.html`
        )
        const tagJSONConfigPath = path.join(
          tagDirPath,
          constants.TAG_CONFIG_DIR_NAME,
          `${tag}.json`
        )
        let tagData: string = this.prepareContentForWriteNewBlogLinkToTags(
          tagFilePath,
          tagDirPath,
          tag,
          blogLink,
          title,
          date,
          publishMode
        )

        return Promise.all([
          FileDirHelpers.writeFilePromise(tagFilePath, tagData),
          this.checkAndWriteTagConfigFileDown(
            title,
            blogLink,
            date,
            publishMode,
            tagJSONConfigPath
          )
        ])
      })

      return Promise.all(writeLinkToTagFileProcess)
    } catch (error) {
      throw error
    }
  }

  public checkAndWriteTagConfigFileDown(
    title: string,
    blogLink: string,
    date: Date,
    publishMode: string,
    tagJSONConfigPath: string
  ): Promise<any> {
    try {
      if (!fs.existsSync(tagJSONConfigPath)) {
        /** If file does not exist then create new one */
        const tagConfigObject = {
          blogs: [
            {
              title,
              blogLink,
              date,
              publishMode
            }
          ]
        }

        return FileDirHelpers.writeFilePromise(
          tagJSONConfigPath,
          JSON.stringify(tagConfigObject)
        )
      }
      return this.addNewBlogInfoToTagConfigFile(
        title,
        date,
        blogLink,
        publishMode,
        tagJSONConfigPath
      )
    } catch (error) {
      throw error
    }
  }

  public addNewBlogInfoToTagConfigFile(
    title: string,
    date: Date,
    blogLink: string,
    publishMode: string,
    tagJSONConfigPath: string
  ): Promise<any> {
    try {
      const configContent: string = fs.readFileSync(tagJSONConfigPath, {
        encoding: 'utf-8'
      })
      const configObject = JSON.parse(configContent)
      configObject.blogs.push({
        title,
        date,
        publishMode,
        blogLink
      })

      return FileDirHelpers.writeFilePromise(
        tagJSONConfigPath,
        JSON.stringify(configObject)
      )
    } catch (error) {
      throw error
    }
  }

  public prepareContentForWriteNewBlogLinkToTags(
    tagFilePath: string,
    tagDirPath: string,
    tag: string,
    blogLink: string,
    title: string,
    date: Date,
    publishMode: string
  ): string {
    try {
      let tagData: string
      if (!fs.existsSync(tagFilePath)) {
        /** If tag file is not exists */
        const newTagFileContent: string = this.createHtmlContentForNewTag(
          blogLink,
          title,
          tag
        )
        tagData = newTagFileContent
      } else {
        /** If tag file is already existed */
        tagData = this.createHtmlContentForExistedTagFile(
          tagDirPath,
          tag,
          blogLink,
          title,
          date,
          publishMode
        )
      }

      return tagData
    } catch (error) {
      throw error
    }
  }

  public updateAllCurrentTagsInEachTagFile(
    tagDirPath: string,
    blogDefaultUrl: string
  ): Promise<any> {
    try {
      const tagHtmlFiles: Array<string> = fs.readdirSync(
        path.join(tagDirPath, constants.TAG_HTML_DIR_NAME)
      )
      const tagsName: Array<string> = tagHtmlFiles.map((tagFile: string) => {
        return FileDirHelpers.changeFileExtension(tagFile, '.html', '')
      })
      const tagsHtmlPath: Array<string> = tagHtmlFiles.map(tagFile =>
        path.join(tagDirPath, constants.TAG_HTML_DIR_NAME, tagFile)
      )
      const tagsUrl: Array<string> = tagHtmlFiles.map(tagFile =>
        path.join(blogDefaultUrl, constants.TAG_HTML_DIR_NAME, tagFile)
      )
      const tagsConfigPath: Array<string> = tagHtmlFiles.map(tagFile => {
        const tagConfigFile = FileDirHelpers.changeFileExtension(
          tagFile,
          '.html',
          '.json'
        )
        return path.join(
          tagDirPath,
          constants.TAG_CONFIG_DIR_NAME,
          tagConfigFile
        )
      })

      const allCurrentTagsHtml: string = this.createAllCurrentTagsHtml(
        tagHtmlFiles,
        tagsName,
        tagsUrl
      )

      /** Generate new html content for all tags include all current tags */
      const tagsInfo = tagsConfigPath.map(
        (configPath: string, index: number) => {
          const tagConfigObject = this.getTagFileConfigObject(configPath)
          let tagNewHtmlData = this.createTagHtmlFileData(
            tagConfigObject.blogs,
            tagsName[index]
          )

          /** Append all current tag to each tag new html data */
          tagNewHtmlData = BlogUITemplate.addContentsToTemplate(
            tagNewHtmlData,
            [
              {
                template_sign: '{{otherTags}}',
                content: allCurrentTagsHtml
              }
            ]
          )

          return {
            tagNewHtmlData,
            tagFilePath: tagsHtmlPath[index]
          }
        }
      )

      const updateProcess = tagsInfo.map((info: any) =>
        FileDirHelpers.writeFilePromise(info.tagFilePath, info.tagNewHtmlData)
      )

      return Promise.all(updateProcess)
    } catch (error) {
      throw error
    }
  }

  public createAllCurrentTagsHtml(
    tagHtmlFiles: Array<string>,
    tagHtmlFilesName: Array<string>,
    tagsUrl: Array<string>
  ): string {
    let result = ''
    for (let i = 0; i < tagHtmlFiles.length; i++) {
      result += BlogHtmlElementTemplate.createOtherTagLink(
        tagHtmlFilesName[i],
        tagsUrl[i]
      )
    }

    return result
  }

  public createHtmlContentForNewTag(
    blogLink: string,
    title: string,
    tag: string
  ) {
    try {
      let newTagFileContent: string = BlogUITemplate.getTagFileTemplate()
      const htmlLinkElement: string = BlogHtmlElementTemplate.createTagBlogLink(
        blogLink,
        title
      )

      newTagFileContent = BlogUITemplate.addContentsToTemplate(
        newTagFileContent,
        [
          {
            template_sign: '{{tagTableContent}}',
            content: htmlLinkElement
          },
          {
            template_sign: '{{tagName}}',
            content: tag
          }
        ]
      )

      return newTagFileContent
    } catch (error) {
      throw error
    }
  }

  public createHtmlContentForExistedTagFile(
    tagDirPath: string,
    tag: string,
    blogLink: string,
    title: string,
    date: Date,
    publishMode: string
  ): string {
    try {
      /** Read data of existed tag file */
      const tagJSONFilePath: string = path.join(
        tagDirPath,
        constants.TAG_CONFIG_DIR_NAME,
        `${tag}.json`
      )
      const tagJSONObject = this.getTagFileConfigObject(tagJSONFilePath)

      const blogConfigInTag: IBlogConfigInTag = {
        title,
        blogLink,
        date,
        publishMode
      }

      /** Push new blog config object to blog config object array
       * to map them and create new tag html table content */
      tagJSONObject.blogs.push(blogConfigInTag)
      /** Sort blog ascending by date */
      tagJSONObject.blogs = this.sortBlogConfigArrAscending(tagJSONObject.blogs)

      const tagFileTemplate: string = this.createTagHtmlFileData(
        tagJSONObject.blogs,
        tag
      )

      return tagFileTemplate
    } catch (error) {
      throw error
    }
  }

  public sortBlogConfigArrAscending(
    blogObjectArray: Array<IBlogConfigInTag>
  ): Array<IBlogConfigInTag> {
    const result = blogObjectArray.sort((a, b) => {
      return MyArrayHelpers.compareDateInSortByDateAsc(a.date, b.date)
    })

    return result
  }

  public createTagHtmlFileData(
    blogObjectArray: Array<IBlogConfigInTag>,
    tag: string
  ): string {
    let tagFileTemplate: string = BlogUITemplate.getTagFileTemplate()
    let htmlTableContent = ''

    blogObjectArray.forEach((blog: IBlogConfigInTag) => {
      const blogLinkElement = BlogHtmlElementTemplate.createTagBlogLink(
        blog.blogLink,
        blog.title
      )
      htmlTableContent += blogLinkElement
    })

    tagFileTemplate = BlogUITemplate.addContentsToTemplate(tagFileTemplate, [
      {
        template_sign: '{{tagTableContent}}',
        content: htmlTableContent
      },
      {
        template_sign: '{{tagName}}',
        content: tag
      }
    ])

    return tagFileTemplate
  }

  public getTagFileConfigObject(tagConfigFilePath: string) {
    try {
      const tagJSONContent: string = fs.readFileSync(tagConfigFilePath, {
        encoding: 'utf-8'
      })

      const tagJSONObject = JSON.parse(tagJSONContent)

      return tagJSONObject
    } catch (error) {
      throw error
    }
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

  public handleTagsOfBlogAfterEditBlog(
    newMetadataObject: IMarkdownMetaDataObject,
    oldMetaDataObject: IMarkdownMetaDataObject,
    blogLink: string,
    tagDirPath: string,
    blogDefaultUrl: string,
    htmlFile: string
  ) {
    try {
      /**
       * - newTags to add blog link to those tags (or create new tag if it's not exist)
       * - oldTags to remove blog link from those tags
       * - stableTags to update new info to those tags
       */
      const { newTags, oldTags, stableTags } = this.classifyTagsOfBlogEdit(
        newMetadataObject,
        oldMetaDataObject
      )

      this.removeBlogLinkFromBlogOldTagsProcess(oldTags, blogLink, tagDirPath)
      this.writeBlogLinkToBlogNewTagProcess(
        newTags,
        blogDefaultUrl,
        newMetadataObject,
        tagDirPath,
        htmlFile
      )
      this.updateBlogInfoInStableTagsConfigProcess(
        stableTags,
        blogLink,
        newMetadataObject,
        tagDirPath
      )
    } catch (error) {
      throw error
    }
  }

  public classifyTagsOfBlogEdit(
    newMetadataObject: IMarkdownMetaDataObject,
    oldMetaDataObject: IMarkdownMetaDataObject
  ): ITagTypeOfBlogEdit {
    const newTags = _.difference(newMetadataObject.tags, oldMetaDataObject.tags)
    const oldTags = _.difference(oldMetaDataObject.tags, newMetadataObject.tags)
    const stableTags = _.intersection(
      oldMetaDataObject.tags,
      newMetadataObject.tags
    )
    return {
      newTags,
      oldTags,
      stableTags
    }
  }

  public updateBlogInfoInStableTagsConfigProcess(
    stableTags: Array<string>,
    blogLink: string,
    newMetadataObject: IMarkdownMetaDataObject,
    tagDirPath: string
  ): Promise<any> {
    try {
      const writeProcess = stableTags.map(tag => {
        const tagFilePath = path.join(
          tagDirPath,
          constants.TAG_HTML_DIR_NAME,
          `${tag}.html`
        )
        const tagConfigFilePath = path.join(
          tagDirPath,
          constants.TAG_CONFIG_DIR_NAME,
          `${tag}.json`
        )
        let tagJSONObject = this.getTagFileConfigObject(tagConfigFilePath)

        /** Update config info for edited blog */
        tagJSONObject = this.updateBlogInfoOfEditedBlog(
          tagJSONObject,
          blogLink,
          newMetadataObject
        )

        /** Generate new html content for tag file with edited blog new info */
        const tagHtmlFileData: string = this.createTagHtmlFileData(
          tagJSONObject.blogs,
          tag
        )

        /** Save html & config content */
        return Promise.all([
          FileDirHelpers.writeFilePromise(tagFilePath, tagHtmlFileData),
          FileDirHelpers.writeFilePromise(
            tagConfigFilePath,
            JSON.stringify(tagJSONObject)
          )
        ])
      })

      return Promise.all(writeProcess)
    } catch (error) {
      throw error
    }
  }

  public updateBlogInfoOfEditedBlog(
    tagJSONObject: any,
    blogLink: string,
    newMetadataObject: IMarkdownMetaDataObject
  ) {
    /** Find edit blog position in blogs array to update new info */
    const editedBlogPosition = tagJSONObject.blogs.findIndex(
      (blog: IBlogConfigInTag) => blog.blogLink === blogLink
    )

    /** Replace edited blog with new info */
    tagJSONObject.blogs[editedBlogPosition] = {
      title: newMetadataObject.title,
      date: newMetadataObject.date,
      publishMode: newMetadataObject.publishMode,
      blogLink
    }

    return tagJSONObject
  }

  public writeBlogLinkToBlogNewTagProcess(
    blogNewTags: Array<string>,
    blogDefaultUrl: string,
    newMetadataObject: IMarkdownMetaDataObject,
    tagDirPath: string,
    htmlFileName: string
  ): Promise<any> {
    try {
      /** Replace tags array in newMetadataObject by blogNewTags (this array just contains new tags)
       * to make sure just do this job with new tag
       * */

      // clone newMetadataObject to metaDatObject to replace tags array to prevent effect on original
      // newMetadataObject to use at the next middleware
      const metaDatObject = _.clone(newMetadataObject)
      metaDatObject.tags = blogNewTags

      return this.saveNewBlogLinkToTags(
        blogDefaultUrl,
        tagDirPath,
        htmlFileName,
        metaDatObject
      )
    } catch (error) {
      throw error
    }
  }

  public removeBlogLinkFromBlogOldTagsProcess(
    blogOldTags: Array<string>,
    blogLink: string,
    tagDirPath: string
  ): Promise<any> {
    try {
      const removeProcess = blogOldTags.map(tag => {
        this.removeBlogLinkFromTag(tagDirPath, tag, blogLink)
      })

      return Promise.all(removeProcess)
    } catch (error) {
      throw error
    }
  }

  public removeBlogLinkFromTag(
    tagDirPath: string,
    tag: string,
    blogLink: string
  ): Promise<any> {
    try {
      const tagFilePath = path.join(
        tagDirPath,
        constants.TAG_HTML_DIR_NAME,
        `${tag}.html`
      )
      const tagConfigFilePath = path.join(
        tagDirPath,
        constants.TAG_CONFIG_DIR_NAME,
        `${tag}.json`
      )

      const tagJSONObject = this.getTagFileConfigObject(tagConfigFilePath)

      this.removeBlogLinkFromTagConfigObject(tagJSONObject, blogLink)

      /** Generate new html content for tag file without deleted blog link */
      const tagHtmlFileData: string = this.createTagHtmlFileData(
        tagJSONObject.blogs,
        tag
      )

      return Promise.all([
        /** Write tag config file **/
        FileDirHelpers.writeFilePromise(
          tagConfigFilePath,
          JSON.stringify(tagJSONObject)
        ),
        /** Write tag html file **/
        FileDirHelpers.writeFilePromise(tagFilePath, tagHtmlFileData)
      ])
    } catch (error) {
      throw error
    }
  }

  public removeBlogLinkFromTagConfigObject(
    tagJSONObject: any,
    blogLink: string
  ) {
    try {
      /** Find blog which has link same with the link need to remove in config object and eliminate it */
      tagJSONObject.blogs.splice(
        tagJSONObject.blogs.findIndex(
          (blog: IBlogConfigInTag) => blog.blogLink === blogLink
        ),
        1
      )
    } catch (error) {
      throw error
    }
  }

  public removeDeletedBlogLinkFromTags(
    tags: Array<string>,
    tagDirPath: string,
    blogLink: string
  ): Promise<any> {
    try {
      return this.removeBlogLinkFromBlogOldTagsProcess(
        tags,
        blogLink,
        tagDirPath
      )
    } catch (error) {
      throw error
    }
  }
}

export default new TagService()
