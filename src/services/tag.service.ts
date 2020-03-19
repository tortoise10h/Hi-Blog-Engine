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
  tags: Array<string>
  minRead: number
}

interface ITagTypeOfBlogEdit {
  newTags: Array<string>
  oldTags: Array<string>
  stableTags: Array<string>
}

class TagService {
  public saveNewBlogLinkToTags(
    blogDefaultUrl: string,
    tagUrl: string,
    tagDirPath: string,
    htmlFile: string,
    newBlogMetaDataObject: IMarkdownMetaDataObject,
    minRead: number
  ): Promise<any> {
    try {
      return this.writeNewBlogLinkToTagsProcess(
        tagDirPath,
        tagUrl,
        htmlFile,
        newBlogMetaDataObject,
        minRead
      )
    } catch (error) {
      throw error
    }
  }

  public writeNewBlogLinkToTagsProcess(
    tagDirPath: string,
    tagUrl: string,
    blogLink: string,
    metaDataObject: IMarkdownMetaDataObject,
    minRead: number
  ): Promise<any> {
    try {
      /** Loop through all tags of blog
       * If tag is not exists then create file and write the link
       * If tag is exists then append new blog link
       * */
      const writeLinkToTagFileProcess = metaDataObject.tags.map(tag => {
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
        const blogConfigInTag: IBlogConfigInTag = {
          ...metaDataObject,
          blogLink,
          minRead
        }
        let tagData: string = this.prepareContentForWriteNewBlogLinkToTags(
          tagFilePath,
          tagDirPath,
          tag,
          tagUrl,
          blogConfigInTag
        )

        /** If blog publish mode is note private then
         * save new blog to tag config and create new html content for tag
         * */
        if (metaDataObject.publishMode !== constants.PUBLISH_MODES.PRIVATE) {
          return Promise.all([
            FileDirHelpers.writeFilePromise(tagFilePath, tagData),
            this.checkAndWriteTagConfigFileDown(
              blogConfigInTag,
              tagJSONConfigPath
            )
          ])
        }
        /** If blog publish mode is private then just save blog to config but
         * not generate new html content for tag
         */
        return Promise.all([
          this.checkAndWriteTagConfigFileDown(
            blogConfigInTag,
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
    blogConfigInTag: IBlogConfigInTag,
    tagJSONConfigPath: string
  ): Promise<any> {
    try {
      if (!fs.existsSync(tagJSONConfigPath)) {
        /** If file does not exist then create new one */
        const tagConfigObject = {
          blogs: [
            {
              ...blogConfigInTag
            }
          ]
        }

        return FileDirHelpers.writeFilePromise(
          tagJSONConfigPath,
          JSON.stringify(tagConfigObject)
        )
      }
      return this.addNewBlogInfoToTagConfigFile(
        blogConfigInTag,
        tagJSONConfigPath
      )
    } catch (error) {
      throw error
    }
  }

  public addNewBlogInfoToTagConfigFile(
    blogConfigInTag: IBlogConfigInTag,
    tagJSONConfigPath: string
  ): Promise<any> {
    try {
      const configContent: string = fs.readFileSync(tagJSONConfigPath, {
        encoding: 'utf-8'
      })
      const configObject = JSON.parse(configContent)

      configObject.blogs = this.handleAddNewBlogConfigToBlogConfigArray(
        blogConfigInTag,
        configObject.blogs
      )

      return FileDirHelpers.writeFilePromise(
        tagJSONConfigPath,
        JSON.stringify(configObject)
      )
    } catch (error) {
      throw error
    }
  }

  public handleAddNewBlogConfigToBlogConfigArray(
    blogConfigInTag: IBlogConfigInTag,
    blogConfigArray: Array<IBlogConfigInTag>
  ): Array<IBlogConfigInTag> {
    try {
      const blogConfigPosition: number = blogConfigArray.findIndex(
        (blog: IBlogConfigInTag) => blog.blogLink === blogConfigInTag.blogLink
      )

      if (blogConfigPosition !== -1) {
        blogConfigArray[blogConfigPosition] = blogConfigInTag
      } else {
        blogConfigArray.push(blogConfigInTag)
      }

      return blogConfigArray
    } catch (error) {
      throw error
    }
  }

  public prepareContentForWriteNewBlogLinkToTags(
    tagFilePath: string,
    tagDirPath: string,
    tag: string,
    tagUrl: string,
    blogConfigInTag: IBlogConfigInTag
  ): string {
    try {
      let tagData: string
      if (!fs.existsSync(tagFilePath)) {
        /** If tag file is not exists */
        const newTagFileContent: string = this.createHtmlContentForNewTag(
          blogConfigInTag,
          tag,
          tagUrl
        )
        tagData = newTagFileContent
      } else {
        /** If tag file is already existed */
        tagData = this.createHtmlContentForExistedTagFile(
          tagDirPath,
          tag,
          blogConfigInTag,
          tagUrl
        )
      }

      return tagData
    } catch (error) {
      throw error
    }
  }

  public updateAllCurrentTagsInEachTagFile(
    tagDirPath: string,
    tagUrl: string
  ): Promise<any> {
    try {
      const allHtmlTagFiles: Array<string> = fs.readdirSync(
        path.join(tagDirPath, constants.TAG_HTML_DIR_NAME)
      )

      const tagsName: Array<string> = allHtmlTagFiles.map((tagFile: string) => {
        return FileDirHelpers.changeFileExtension(tagFile, '.html', '')
      })
      const tagsHtmlPath: Array<string> = allHtmlTagFiles.map(tagFile =>
        path.join(tagDirPath, constants.TAG_HTML_DIR_NAME, tagFile)
      )
      const tagsUrl: Array<string> = allHtmlTagFiles.map(tagFile =>
        path.join(tagUrl, tagFile)
      )
      const tagsConfigPath: Array<string> = allHtmlTagFiles.map(tagFile => {
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
        allHtmlTagFiles,
        tagsName,
        tagsUrl
      )

      /** Generate new html content for all tags include all current tags */
      const tagsInfo = tagsConfigPath.map(
        (configPath: string, index: number) => {
          const tagConfigObject = this.getTagFileConfigObject(configPath)
          const publishBlogs = this.getOnlyPublishBlogsConfig(
            tagConfigObject.blogs
          )
          let tagNewHtmlData = this.createTagHtmlFileData(
            publishBlogs,
            tagsName[index]
          )

          /** Append all current tag to each tag new html data */
          const data: string = BlogUITemplate.addContentsToTemplate(
            tagNewHtmlData,
            [
              {
                template_sign: '{{otherTags}}',
                content: allCurrentTagsHtml
              }
            ]
          )
          return {
            tagNewHtmlData: data,
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
      result += BlogHtmlElementTemplate.createOtherTagLink(tagHtmlFilesName[i])
    }

    return result
  }

  public createHtmlContentForNewTag(
    blogConfigInTag: IBlogConfigInTag,
    tag: string,
    tagUrl: string
  ) {
    try {
      let newTagFileContent: string = BlogUITemplate.getTagFileTemplate()
      let htmlLinkElement: string = ''
      if (blogConfigInTag.publishMode !== constants.PUBLISH_MODES.PRIVATE) {
        /** If blog is not private then create html link */
        const blogOfTagTags: string = BlogHtmlElementTemplate.createBlogOfTagTags(
          blogConfigInTag.tags
        )
        htmlLinkElement = BlogHtmlElementTemplate.createTagBlogLink(
          blogConfigInTag.blogLink,
          blogConfigInTag.title,
          blogConfigInTag.date,
          blogOfTagTags,
          blogConfigInTag.minRead
        )
      }

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
    blogConfigInTag: IBlogConfigInTag,
    tagUrl: string
  ): string {
    try {
      /** Read data of existed tag file */
      const tagJSONFilePath: string = path.join(
        tagDirPath,
        constants.TAG_CONFIG_DIR_NAME,
        `${tag}.json`
      )
      const tagJSONObject = this.getTagFileConfigObject(tagJSONFilePath)

      /** Push new blog config object to blog config object array
       * to map them and create new tag html table content */
      const blogConfigInTagPosition: number = tagJSONObject.blogs.findIndex(
        (blog: IBlogConfigInTag) => blog.blogLink === blogConfigInTag.blogLink
      )
      if (blogConfigInTagPosition === -1) {
        tagJSONObject.blogs.push(blogConfigInTag)
      } else {
        tagJSONObject.blogs[blogConfigInTagPosition] = blogConfigInTag
      }

      /** Only use publish blog to show */
      let publishBlogs: Array<IBlogConfigInTag> = this.getOnlyPublishBlogsConfig(
        tagJSONObject.blogs
      )
      /** Sort blog ascending by date */
      publishBlogs = this.sortBlogConfigArrAscending(publishBlogs)

      const tagFileTemplate: string = this.createTagHtmlFileData(
        publishBlogs,
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

  public getOnlyPublishBlogsConfig(
    blogConfigArray: Array<IBlogConfigInTag>
  ): Array<IBlogConfigInTag> {
    try {
      const result: Array<IBlogConfigInTag> = blogConfigArray.filter(
        (blog: IBlogConfigInTag) =>
          blog.publishMode === constants.PUBLISH_MODES.PUBLISH
      )

      return result
    } catch (error) {
      throw error
    }
  }

  public createTagHtmlFileData(
    blogObjectArray: Array<IBlogConfigInTag>,
    tag: string
  ): string {
    let tagFileTemplate: string = BlogUITemplate.getTagFileTemplate()
    let htmlTableContent = ''

    blogObjectArray.forEach((blog: IBlogConfigInTag) => {
      const blogOfTagTags: string = BlogHtmlElementTemplate.createBlogOfTagTags(
        blog.tags
      )
      const blogLinkElement = BlogHtmlElementTemplate.createTagBlogLink(
        blog.blogLink,
        blog.title,
        blog.date,
        blogOfTagTags,
        blog.minRead
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
      let tagJSONObject: any = {
        blogs: []
      }
      if (FileDirHelpers.isFileExisted(tagConfigFilePath)) {
        const tagJSONContent: string = fs.readFileSync(tagConfigFilePath, {
          encoding: 'utf-8'
        })
        if (!tagJSONContent) {
          tagJSONObject = {
            blogs: []
          }
        } else {
          tagJSONObject = JSON.parse(tagJSONContent)
        }
      }

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
    htmlFile: string,
    tagUrl: string,
    minRead: number
  ): Promise<any> {
    try {
      /**
       * - oldTags to remove blog link from those tags
       */
      const { oldTags } = this.classifyTagsOfBlogEdit(
        newMetadataObject,
        oldMetaDataObject
      )

      return Promise.all([
        this.removeBlogLinkFromBlogOldTagsProcess(
          oldTags,
          blogLink,
          tagDirPath,
          tagUrl
        ),
        this.writeBlogLinkToBlogNewAndCurrentTagsProcess(
          blogDefaultUrl,
          newMetadataObject,
          tagDirPath,
          htmlFile,
          tagUrl,
          minRead
        )
      ])
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
    tagDirPath: string,
    minRead: number
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
          newMetadataObject,
          minRead
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
    newMetadataObject: IMarkdownMetaDataObject,
    minRead: number
  ) {
    /** Find edit blog position in blogs array to update new info */
    const editedBlogPosition = tagJSONObject.blogs.findIndex(
      (blog: IBlogConfigInTag) => blog.blogLink === blogLink
    )

    /** Replace edited blog with new info */
    tagJSONObject.blogs[editedBlogPosition] = {
      ...newMetadataObject,
      blogLink,
      minRead
    }

    return tagJSONObject
  }

  public writeBlogLinkToBlogNewAndCurrentTagsProcess(
    blogDefaultUrl: string,
    newMetadataObject: IMarkdownMetaDataObject,
    tagDirPath: string,
    htmlFileName: string,
    tagUrl: string,
    minRead: number
  ): Promise<any> {
    try {
      /** Replace tags array in newMetadataObject by blogNewTags (this array just contains new tags)
       * to make sure just do this job with new tag
       * */

      // clone newMetadataObject to metaDatObject to replace tags array to prevent effect on original
      // newMetadataObject to use at the next middleware
      const metaDatObject = _.clone(newMetadataObject)

      return this.saveNewBlogLinkToTags(
        blogDefaultUrl,
        tagUrl,
        tagDirPath,
        htmlFileName,
        metaDatObject,
        minRead
      )
    } catch (error) {
      throw error
    }
  }

  public removeBlogLinkFromBlogOldTagsProcess(
    blogOldTags: Array<string>,
    blogLink: string,
    tagDirPath: string,
    tagUrl: string
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

      tagJSONObject.blogs = this.removeBlogLinkFromTagConfigObject(
        tagJSONObject.blogs,
        blogLink
      )

      /** Generate new html content for tag file without deleted blog link */
      // only genereate with publish blogs
      const publishBlogs = this.getOnlyPublishBlogsConfig(tagJSONObject.blogs)
      const tagHtmlFileData: string = this.createTagHtmlFileData(
        publishBlogs,
        tag
      )

      /** If blog of tag is empty then delete tag else just write new config down */
      let writeTagConfigPromise: Promise<any>
      if (tagJSONObject.blogs.length > 0) {
        writeTagConfigPromise = FileDirHelpers.writeFilePromise(
          tagConfigFilePath,
          JSON.stringify(tagJSONObject)
        )
      } else {
        writeTagConfigPromise = this.deleteTag(tagConfigFilePath, tagFilePath)
      }

      return Promise.all([
        /** Write tag config file **/
        writeTagConfigPromise,
        /** Write tag html file **/
        FileDirHelpers.writeFilePromise(tagFilePath, tagHtmlFileData)
      ])
    } catch (error) {
      throw error
    }
  }

  public removeBlogLinkFromTagConfigObject(
    blogsInfoArray: Array<IBlogConfigInTag>,
    blogLink: string
  ) {
    try {
      const result: Array<IBlogConfigInTag> = blogsInfoArray.filter(
        (blog: IBlogConfigInTag) => blog.blogLink !== blogLink
      )

      return result
    } catch (error) {
      throw error
    }
  }

  public removeDeletedBlogLinkFromTags(
    metaDatObject: IMarkdownMetaDataObject,
    tagDirPath: string,
    blogLink: string,
    tagUrl: string
  ): Promise<any> {
    try {
      return this.removeBlogLinkFromBlogOldTagsProcess(
        metaDatObject.tags,
        blogLink,
        tagDirPath,
        tagUrl
      )
    } catch (error) {
      throw error
    }
  }

  public deleteTag(
    tagConfigFilePath: string,
    tagHtmlFilePath: string
  ): Promise<any> {
    try {
      return Promise.all([
        FileDirHelpers.removeFilePromise(tagConfigFilePath),
        FileDirHelpers.removeFilePromise(tagHtmlFilePath)
      ])
    } catch (error) {
      throw error
    }
  }
}

export default new TagService()
