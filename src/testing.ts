import fs from 'fs'
import path from 'path'
import util from 'util'
import moment from 'moment'
import FileDirHelpers from './helpers/file-dir-helpers'
import HtmlBlockTemplate from './helpers/blog-html-element-template'

interface IDog {
  name: string
  hobby?: string
}

interface IRectangle {
  readonly width: number
  readonly height: number
  color?: string
  owner: string
}

interface IGreetingFunc {
  (message: string, name: string): void
}

interface IShape {
  shapeColor: string
}

interface ISquare {
  [index: string]: number
  [index: number]: number
}

const square: ISquare = {
  width: 100,
  shapeColor: 'blue'
}

// const showRectanleInfo = (rectangleInfo: IRectangle): void => {
// const defaultSystemRec = {
// width: 200,
// height: 100,
// color: 'white',
// owner: 'anonymous'
// }
// console.log(`
// width: ${rectangleInfo.width},
// height: ${rectangleInfo.height},
// owner: ${rectangleInfo.owner},
// color: ${rectangleInfo.color || defaultSystemRec.color}
// `)
// }

// const huyRectangle: IRectangle = {
// width: 250,
// height: 90,
// owner: 'Hi'
// }

// const fakeHuyRec = {
// owner: 'Hi',
// colour: 'white'
// }

// showRectanleInfo(fakeHuyRec)
