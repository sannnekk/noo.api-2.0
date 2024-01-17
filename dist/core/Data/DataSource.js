import { DataSource } from 'typeorm';
// Models
import { UserModel } from '../../Users/Data/UserModel';
import { CourseModel } from '../../Courses/Data/CourseModel';
import { CourseChapterModel } from '../../Courses/Data/Relations/CourseChapterModel';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel';
import { WorkModel } from '../../Works/Data/WorkModel';
import { WorkTaskModel } from '../../Works/Data/Relations/WorkTaskModel';
import { WorkTaskOptionModel } from '../../Works/Data/Relations/WorkTaskOptionModel';
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel';
import { AssignedWorkAnswerModel } from '../../AssignedWorks/Data/Relations/AssignedWorkAnswerModel';
import { AssignedWorkCommentModel } from '../../AssignedWorks/Data/Relations/AssignedWorkCommentModel';
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
});
