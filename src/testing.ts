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

const func1 = () => {
  return new Promise(resolve => {
    console.log('func1')
    resolve('func 1 ok')
  })
}

const func2 = () => {
  return new Promise(resolve => {
    console.log('func2')
    resolve('func 2 ok')
  })
}

const func3 = () => {
  return Promise.all([func1, func2])
}

const func4 = () => {
  return Promise.all([func1, func2])
}

const func5 = () => {
  return Promise.all([func3, func4])
}

const run = async () => {
  const func5Result = await func5()
  console.log('============> Huy Debugs :>: run -> func5Result', func5Result)
  func3().then(result => {
    console.log('============> Huy Debugs :>: run -> func3Result', result)
  })
}

// run()

const arr: Array<any> = [
  [1, 2],
  [2, 3],
  [3, 4]
]
console.log('============> Huy Debugs :>: arr', _.flatten(arr))
