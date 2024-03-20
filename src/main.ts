import express from 'express'
import cors from 'cors'
import 'reflect-metadata'
import { CoreDataSource } from '@modules/Core/Data/DataSource'
import { ContextMiddleware } from '@modules/Core/Request/ContextMiddleware'

// import modules
import { UserController } from '@modules/Users/UserController'
import { CourseController } from '@modules/Courses/CourseController'
import { WorkController } from '@modules/Works/WorkController'
import { AssignedWorkController } from '@modules/AssignedWorks/AssignedWorkController'
import { MediaController } from '@modules/Media/MediaController'
import { CalenderController } from '@modules/Calender/CalenderController'
import { attachControllers } from '@decorators/express'

await CoreDataSource.initialize()

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

app.use(ContextMiddleware)

attachControllers(app, [
	UserController,
	CourseController,
	WorkController,
	AssignedWorkController,
	MediaController,
	CalenderController,
])

app.listen(process.env.APP_PORT, () =>
	console.log(`Server is running on port ${process.env.APP_PORT}`)
)
