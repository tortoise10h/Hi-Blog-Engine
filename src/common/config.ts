import path from 'path'
import constants from './constants'

interface IEnviromentVariables {
  blogRootPath: string
  blogDefaultUrl: string
  markdownDirPath: string
  htmlDirPath: string
  tagDirPath: string
  tagConfigDirPath: string
  tagHtmlDirPath: string
  [propName: string]: any
}

class Config {
  public static getEnviromentVariables(): IEnviromentVariables {
    const blogRootPath = process.env.SERVER_BLOG_DIRECTORY || ''
    const blogDefaultUrl =
      process.env.SERVER_BLOG_DEFAULT_URL || 'http://localhost:5099'
    const markdownDirPath = path.join(blogRootPath, constants.MARKDOWN_DIR_NAME)
    const htmlDirPath = path.join(blogRootPath, constants.HTML_DIR_NAME)
    const tagDirPath = path.join(blogRootPath, constants.TAG_DIR_NAME)
    const tagConfigDirPath = path.join(
      tagDirPath,
      constants.TAG_CONFIG_DIR_NAME
    )
    const tagHtmlDirPath = path.join(tagDirPath, constants.TAG_HTML_DIR_NAME)
    const tagUrl = path.join(
      blogDefaultUrl,
      constants.TAG_DIR_NAME,
      constants.TAG_HTML_DIR_NAME
    )
    const baseBlogImageLocation = path.join(blogRootPath, 'img', 'blog-img')

    return {
      blogRootPath,
      blogDefaultUrl,
      markdownDirPath,
      htmlDirPath,
      tagDirPath,
      tagConfigDirPath,
      tagHtmlDirPath,
      tagUrl,
      baseBlogImageLocation
    }
  }
}

export default Config
