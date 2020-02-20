import express, { Request, Response, NextFunction } from 'express'
import constants from '../common/constants'
import APIError from '../helpers/api-error'
// import blogController from '../controllers/blog.controller'
// import BlogDirectoryController from '../controllers/blog-directory.controller'
// import TagController from '../controllers/tag.controller'

const router = express.Router()

router.route('/ok').get((req: Request, res: Response) => {
  console.log('In there')
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end('ok')
})
/** Home page - Writing blog page */
// router
// .route('/')
// .get(
// BlogDirectoryController.checkValidRootBlogDirectory,
// BlogDirectoryController.getAllMarkdownFiles,
// (req: any, res: Response, next: NextFunction) => {
// const { rootDir } = req

// res.render('editor', {
// rootDir
// })
// }
// )

// [>* Show edit page <]
// router
// .route('/blog-edit/:filePath')
// .get(
// BlogDirectoryController.getAllMarkdownFiles,
// blogController.renderEditorPage
// )
// // .put((req, res, next) => {
// // console.log('Catcha')
// // return next()
// // }, blogController.editBlog)

// [> Save new blog <]
// router
// .route('/blogs')
// .post(
// blogController.saveBlog,
// TagController.saveFileToTag,
// BlogDirectoryController.checkAndCreateMissingFileInHtmlDir,
// BlogDirectoryController.generateIndexHtmlFile
// )

export default router
