import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import {
	injectControllers,
	setContextClass,
} from 'express-controller-decorator'
import { Context, CoreDataSource, MediaMiddleware } from '@core'

// import modules
import '@modules/Users/UserController'
import '@modules/Courses/CourseController'
import '@modules/Works/WorkController'
import '@modules/AssignedWorks/AssignedWorkController'
import '@modules/Media/MediaController'
import '@modules/CRM/CRMController'
import '@modules/Calender/CalenderController'

await CoreDataSource.initialize()

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

app.use(MediaMiddleware)

setContextClass(Context)
injectControllers(app)

app.listen(process.env.APP_PORT, () =>
	console.log(`Server is running on port ${process.env.APP_PORT}`)
)

export default app
