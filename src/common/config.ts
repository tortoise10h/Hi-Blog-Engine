import path from 'path'
import constants from './constants'

interface IEnviromentVariables {
  blogRootPath: string
  blogDefaultUrl: string
  markdownDirPath: string
  htmlDirPath: string
  tagDirPath: string
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

    return {
      blogRootPath,
      blogDefaultUrl,
      markdownDirPath,
      htmlDirPath,
      tagDirPath
    }
  }
}

export default Config
