import fs from 'fs'
import path from 'path'
import util from 'util'
import _ from 'lodash'
import moment from 'moment'
import FileDirHelpers from './helpers/file-dir-helpers'
import BlogHtmlElementTemplate from './helpers/blog-html-element-template'
import BlogUITemplate from './lib/blog-ui-template'
import TagService from './services/tag.service'

TagService.writeNewBlogConfigInfoToStableTagsProcess(
  ['blog'],
  'file:/D:/Hi-Blogs/html/yesterday-blog.html',
  {
    date: new Date(),
    title: 'The title ever',
    tags: ['blog', 'talk'],
    publishMode: 'publish'
  },
  '/mnt/d/Hi-Blogs/tag',
  'yesterday-blog.html'
)
