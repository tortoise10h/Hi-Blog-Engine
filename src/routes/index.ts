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
  tagDirPath,
  tagConfigDirPath,
  tagHtmlDirPath,
  tagUrl
} = Config.getEnviromentVariables()

/** Initialize controller instances */
const blogController = new BlogController(
  blogRootPath,
  markdownDirPath,
  htmlDirPath,
  blogDefaultUrl
)
const blogDirectoryController = new BlogDirectoryController(
  blogRootPath,
  blogDefaultUrl,
  markdownDirPath,
  htmlDirPath,
  tagUrl
)
const tagController = new TagController(
  blogDefaultUrl,
  tagDirPath,
  tagConfigDirPath,
  tagHtmlDirPath,
  tagUrl
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

router
  .route('/blogs-edit/:markdownFile')
  /** Render edit blog page */
  .get(
    (req: any, res: Response, next: NextFunction) => {
      blogDirectoryController.getAllMarkdownFiles(req, res, next)
    },
    (req: Request, res: Response, next: NextFunction) => {
      blogController.renderEditorPage(req, res, next)
    }
  )
  /** Edit blog api */
  .put(
    (req: any, res: Response, next: NextFunction) => {
      blogController.editBlog(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      tagController.handleTagsOfBlogEdit(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      tagController.updateAllCurrentTagsInEachTagFile(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      blogDirectoryController.updateIndexHtmlAfterUpdateBlog(req, res, next)
    }
  )
  /** Delete blog api */
  .delete(
    (req: any, res: Response, next: NextFunction) => {
      blogController.deleteBlog(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      tagController.removeDeletedBlogLinkFromTag(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      tagController.updateAllCurrentTagsInEachTagFile(req, res, next)
    },
    (req: any, res: Response, next: NextFunction) => {
      blogDirectoryController.removeDeletedBlogLinkFromIndexFile(req, res, next)
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
    tagController.updateAllCurrentTagsInEachTagFile(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    blogDirectoryController.checkAndCreateMissingFileInHtmlDir(req, res, next)
  },
  (req: any, res: Response, next: NextFunction) => {
    blogDirectoryController.generateIndexHtmlFileWithNewBlog(req, res, next)
  }
)

/** Handle unknow route */
router.get('*', (req: Request, res: Response) => {
  res.send('This route is not even real -_-')
})

export default router
