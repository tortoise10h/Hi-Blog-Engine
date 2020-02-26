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

const filePath = '/mnt/d/Hi-Blogs/test.txt'

const metaDataObject = {
  data: new Date(),
  tags: ['tag1', 'tag2'],
  publishMode: 'publish',
  title: 'this is a title'
}

const a = _.clone(metaDataObject)
const b = _.cloneDeep(metaDataObject)

console.log(`=========> a: ${util.inspect(a, false, null, true)}`)
console.log(`=========> b: ${util.inspect(b, false, null, true)}`)
