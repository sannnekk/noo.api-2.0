import { DataSource } from 'typeorm'

// Models
import { MediaModel } from '@modules/Media/Data/MediaModel'
import { UserModel } from '@modules/Users/Data/UserModel'
import { CourseModel } from '@modules/Courses/Data/CourseModel'
import { CourseChapterModel } from '@modules/Courses/Data/Relations/CourseChapterModel'
import { CourseMaterialModel } from '@modules/Courses/Data/Relations/CourseMaterialModel'
import { WorkModel } from '@modules/Works/Data/WorkModel'
import { WorkTaskModel } from '@modules/Works/Data/Relations/WorkTaskModel'
import { AssignedWorkModel } from '@modules/AssignedWorks/Data/AssignedWorkModel'
import { AssignedWorkAnswerModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkAnswerModel'
import { AssignedWorkCommentModel } from '@modules/AssignedWorks/Data/Relations/AssignedWorkCommentModel'
import { CourseRequestModel } from '@modules/CRM/Data/CourseRequestModel'
import { CalenderEventModel } from '@modules/Calender/Data/CalenderEventModel'

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
		MediaModel,
		UserModel,
		CourseModel,
		CourseChapterModel,
		CourseMaterialModel,
		WorkModel,
		WorkTaskModel,
		AssignedWorkModel,
		AssignedWorkAnswerModel,
		AssignedWorkCommentModel,
		CourseRequestModel,
		CalenderEventModel,
	],
	subscribers: [],
	migrations: [],
})
