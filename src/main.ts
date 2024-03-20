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
import {
	attachControllerInstances,
	attachControllers,
} from '@decorators/express'

await CoreDataSource.initialize()

const app = express()

app.use(cors())
app.use(
	express.json({
		limit: '50mb',
		reviver: (_, value) => {
			if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
				return new Date(value)
			}

			return value
		},
	})
)
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(ContextMiddleware)

attachControllerInstances(app, [
	new UserController(),
	new CourseController(),
	new WorkController(),
	new AssignedWorkController(),
	new MediaController(),
	new CalenderController(),
])

app.listen(process.env.APP_PORT, () =>
	console.log(`Server is running on port ${process.env.APP_PORT}`)
)
