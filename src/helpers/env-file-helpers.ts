import { Request, Response, NextFunction } from 'express'

class EnvFileHelpers {
  checkEnvImportantFieldsToStartServer(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!process.env.SERVER_BLOG_DIRECTORY) {
      console.log(
        `[ERROR] -----------> Please add field SERVER_BLOG_DIRECTORY to .env file to run server (Example: SERVER_BLOG_DIRECTORY='/mnt/d/blog')`
      )
      process.exit(1)
    }

    if (!process.env.SERVER_BLOG_DEFAULT_URL) {
      console.log(
        `[ERROR] -----------> Please add field SERVER_BLOG_DEFAULT_URL to .env file to run server (Example: SERVER_BLOG_DEFAULT_URL='https://yourGithubUsername.github.io/your-repo-name') this example for github page`
      )
      process.exit(1)
    }

    return next()
  }
}

export default new EnvFileHelpers()
