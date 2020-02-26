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

const blogDefaultUrl = 'file:/D:/Hi-blogs'

TagService.updateAllCurrentTagsInEachTagFile(
  '/mnt/d/Hi-Blogs/tag',
  'file:/D:/Hi-blogs'
)
