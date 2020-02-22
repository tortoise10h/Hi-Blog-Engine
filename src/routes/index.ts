import express, { Request, Response, NextFunction } from 'express'
import path from 'path'
import constants from '../common/constants'
import Config from '../common/config'
import APIError from '../helpers/api-error'
import BlogController from '../controllers/blog.controller'
import BlogDirectoryController from '../controllers/blog-directory.controller'
import TagController from '../controllers/tag.controller'

const router = express.Router()

/** Initialize common environemnt variables */
const {
  blogRootPath,
  blogDefaultUrl,
  markdownDirPath,
  htmlDirPath,
  tagDirPath
} = Config.getEnviromentVariables()

/** Initialize controller instances */
const blogController = new BlogController(
  blogRootPath,
  markdownDirPath,
  htmlDirPath
)
const blogDirectoryController = new BlogDirectoryController(
  blogRootPath,
  blogDefaultUrl,
  markdownDirPath,
  htmlDirPath
)
const tagController = new TagController(
  blogRootPath,
  blogDefaultUrl,
  tagDirPath
)

/** Home page - Writing blog page */
router.route('/').get(
  (req: any, res: Response, next: NextFunction) => {
    blogDirectoryController.checkValidRootBlogDirectory(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    blogDirectoryController.getAllMarkdownFiles(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    const { rootDir } = req

    res.render('editor', {
      rootDir
    })
  }
)

/** Show edit page */
router
  .route('/blog-edit/:editedFile')
  .get(
    (req: any, res: Response, next: NextFunction) => {
      blogDirectoryController.getAllMarkdownFiles(req, res, next)
    },
    (req: Request, res: Response, next: NextFunction) => {
      blogController.renderEditorPage(req, res, next)
    }
  )
  .put(
    (req: any, res: Response, next: NextFunction) => {
      blogController.editBlog(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      tagController.handleTagsOfBlogEdit(req, res, next)
    }
  )

/** Save new blog */
router.route('/blogs').post(
  (req: any, res: Response, next: NextFunction) => {
    blogController.saveBlog(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    tagController.saveFileToTag(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    blogDirectoryController.checkAndCreateMissingFileInHtmlDir(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    blogDirectoryController.generateIndexHtmlFile(req, res, next)
  }
)

export default router
