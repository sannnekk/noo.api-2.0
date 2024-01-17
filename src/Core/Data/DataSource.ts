import { DataSource } from 'typeorm'

// Models
import { UserModel } from '@modules/Users/Data/UserModel'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { CourseChapterModel } from '@modules/Courses/Data/Relations/CourseChapterModel'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { WorkTaskOptionModel } from '@modules/Works/Data/Relations/WorkTaskOptionModel'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { AssignedWorkAnswerModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswerModel'
import { AssignedWorkCommentModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkCommentModel'

export const CoreDataSource = new DataSource({
	type: 'mysql',
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	synchronize: true,
	logging: false,
	entities: [
		UserModel,
		CourseModel,
		CourseChapterModel,
		CourseMaterialModel,
		WorkModel,
		WorkTaskModel,
		WorkTaskOptionModel,
		AssignedWorkModel,
		AssignedWorkAnswerModel,
		AssignedWorkCommentModel,
	],
	subscribers: [],
	migrations: [],
})
