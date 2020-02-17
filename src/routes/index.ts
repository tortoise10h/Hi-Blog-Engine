import express, { Request, Response, NextFunction } from 'express'
import constants from '../common/constants'
import APIError from '../helpers/api-error'
import BlogController from '../controllers/blog.controller'
import BlogDirectoryController from '../controllers/blog-directory.controller'
import TagController from '../controllers/tag.controller'

const router = express.Router()

/** Home page - Writing blog page */
router
  .route('/')
  .get(
    BlogDirectoryController.checkValidRootBlogDirectory,
    BlogDirectoryController.getAllMarkdownFiles,
    (req: any, res: Response, next: NextFunction) => {
      const { rootDir } = req

      res.render('editor', {
        rootDir
      })
    }
  )

/* Save new blog */
router
  .route('/blogs')
  .post(
    BlogController.saveBlog,
    TagController.saveFileToTag,
    BlogDirectoryController.checkAndCreateMissingFileInHtmlDir,
    BlogDirectoryController.generateIndexHtmlFile
  )

/** Error testing route */
router
  .route('/error')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    const promise = new Promise((resolve, reject) => {
      reject(new APIError(400, 'reject error instead of throw it'))
    })
    await Promise.resolve(promise)
  })
export default router
