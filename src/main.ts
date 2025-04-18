import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import { CoreDataSource } from '@modules/Core/Data/DataSource'
import {
  injectControllers,
  setContextClass,
} from 'express-controller-decorator'
import { Context } from '@modules/Core/Request/Context'
import { config } from './config'
import { log } from './Core/Logs/Logger'

// import modules
import '@modules/Auth/AuthController'
import '@modules/Users/UserController'
import '@modules/Courses/CourseController'
import '@modules/Works/WorkController'
import '@modules/AssignedWorks/AssignedWorkController'
import '@modules/Media/MediaController'
import '@modules/Calender/CalenderController'
import '@modules/Statistics/StatisticsController'
import '@modules/Blog/BlogController'
import '@modules/Polls/PollController'
import '@modules/CRM/CRMController'
import '@modules/Sessions/SessionsController'
import '@modules/GoogleSheets/GoogleSheetsController'
import '@modules/Platform/PlatformController'
import '@modules/Subjects/SubjectController'
import '@modules/Snippets/SnippetsController'
import '@modules/FAQ/FAQController'
import '@modules/Notifications/NotificationController'
import '@modules/UserSettings/UserSettingsController'
import '@modules/Video/VideoController'
import '@modules/Tables/TableController'

log('info', 'Container created', 'A new container created')

await CoreDataSource.initialize()

const app = express()

app.set('trust proxy', 1)

app.use(cors())
app.use(express.json(config.expressJson))
app.use(express.urlencoded(config.expressUrlencoded))

setContextClass(Context)
injectControllers(app)

app.listen(process.env.APP_PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${process.env.APP_PORT}`)

  log(
    'info',
    'Container initialized',
    'A new container is listening on port ' + process.env.APP_PORT
  )
})

// for test purposes
export default app
