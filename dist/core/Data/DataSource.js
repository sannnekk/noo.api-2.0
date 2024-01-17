import { DataSource } from 'typeorm';
// Models
import { UserModel } from '../../Users/Data/UserModel.js';
import { CourseModel } from '../../Courses/Data/CourseModel.js';
import { CourseChapterModel } from '../../Courses/Data/Relations/CourseChapterModel.js';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel.js';
import { WorkModel } from '../../Works/Data/WorkModel.js';
import { WorkTaskModel } from '../../Works/Data/Relations/WorkTaskModel.js';
import { WorkTaskOptionModel } from '../../Works/Data/Relations/WorkTaskOptionModel.js';
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel.js';
import { AssignedWorkAnswerModel } from '../../AssignedWorks/Data/Relations/AssignedWorkAnswerModel.js';
import { AssignedWorkCommentModel } from '../../AssignedWorks/Data/Relations/AssignedWorkCommentModel.js';
export const CoreDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
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
});
