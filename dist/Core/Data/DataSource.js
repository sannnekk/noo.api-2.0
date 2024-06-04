import { DataSource } from 'typeorm';
// Models
import { MediaModel } from '../../Media/Data/MediaModel.js';
import { UserModel } from '../../Users/Data/UserModel.js';
import { CourseModel } from '../../Courses/Data/CourseModel.js';
import { CourseChapterModel } from '../../Courses/Data/Relations/CourseChapterModel.js';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel.js';
import { WorkModel } from '../../Works/Data/WorkModel.js';
import { WorkTaskModel } from '../../Works/Data/Relations/WorkTaskModel.js';
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel.js';
import { AssignedWorkAnswerModel } from '../../AssignedWorks/Data/Relations/AssignedWorkAnswerModel.js';
import { AssignedWorkCommentModel } from '../../AssignedWorks/Data/Relations/AssignedWorkCommentModel.js';
import { CourseRequestModel } from '../../CRM/Data/CourseRequestModel.js';
import { CalenderEventModel } from '../../Calender/Data/CalenderEventModel.js';
import { BlogPostModel } from '../../Blog/Data/BlogPostModel.js';
import { BlogPostReactionModel } from '../../Blog/Data/Relations/BlogPostReactionModel.js';
import { PollModel } from '../../Polls/Data/PollModel.js';
import { PollQuestionModel } from '../../Polls/Data/Relations/PollQuestionModel.js';
import { PollAnswerModel } from '../../Polls/Data/Relations/PollAnswerModel.js';
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
        PollModel,
        PollQuestionModel,
        PollAnswerModel,
        BlogPostReactionModel,
        BlogPostModel,
    ],
    subscribers: [],
    migrations: [],
});
