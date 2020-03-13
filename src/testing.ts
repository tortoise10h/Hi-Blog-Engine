import fs from 'fs'
import path from 'path'
import util from 'util'
import _ from 'lodash'
import moment from 'moment'
import FileDirHelpers from './helpers/file-dir-helpers'
import BlogHtmlElementTemplate from './helpers/blog-html-element-template'
import BlogUITemplate from './lib/blog-ui-template'
import TagService from './services/tag.service'

const writeFileAsync = util.promisify(fs.writeFile)

const blogDefaultUrl = 'https://tortoise10h.github.io/Hi-Blogs/'
const tagConfigDirPath = path.join(blogDefaultUrl, 'tag', 'config')
const tagDirPath = path.join(blogDefaultUrl, 'tag', 'html')

const allTagHtml = fs.readdirSync(tagDirPath)
const allTagConfig = fs.readdirSync(tagConfigDirPath)

allTagConfig.forEach((tag: any) => {
  const configObject = TagService.getTagFileConfigObject(
    path.join(tagConfigDirPath, tag)
  )
})
