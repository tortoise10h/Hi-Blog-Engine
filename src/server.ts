import express, { Request, Response, NextFunction, Application } from 'express'
import exhbs from 'express-handlebars'
import bodyParser from 'body-parser'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()
import APIResponse from './helpers/api-response'
import EnvFileHelpers from './helpers/env-file-helpers'
import router from './routes/index'

/** Setting server PORT */
const PORT = process.env.SERVER_PORT || 5099

/** Init app */
const app: Application = express()

app.get('/huy', (req, res) => {
  res.end('Yo')
})

/** View engine */
app.set('views', 'src/views')
app.engine(
  'handlebars',
  exhbs({
    defaultLayout: 'main',
    layoutsDir: 'src/views/layouts',
    helpers: {
      /** Only load script at specific file
       * Script files will be put inside {{#secion 'script'}} {{/section}}
       * */
      section: function(name: string, options: any) {
        if (!this._sections) this._sections = {}
        this._sections[name] = options.fn(this)
        return null
      }
    }
  })
)
app.set('view engine', 'handlebars')

/** Specific static folder */
app.use(express.static(path.join(__dirname, 'public')))

/** Body parser */
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

/** Check enough important .env file fields to start server */
app.use(EnvFileHelpers.checkEnvImportantFieldsToStartServer)

/** Router */
app.use(router)

/** Error handling */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  APIResponse.error(err, res)
})

process.on('unhandledRejection', err => {
  console.log('Error ==== :>\n', err)
  process.exit(1)
})

app.listen(PORT, () => {
  process.stdout.write(`Server is running on port ${PORT}...\n`)
})
