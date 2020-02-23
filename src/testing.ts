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

const writeOne = (filePath: string) => {
  return FileDirHelpers.writeFile(filePath, 'huy')
}

const writeTwo = (filePath: string) => {
  return new Promise(resolve => {
    writeFileAsync(filePath, 'huy', { encoding: 'utf-8' })
      .then(() => {
        console.log('ok')
        resolve('ok')
      })
      .catch(err => {
        throw new Error(err)
      })
  })
}

const run = async () => {
  await Promise.resolve(writeTwo(filePath))
  console.log('huy')
}

run()
