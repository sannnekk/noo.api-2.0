import { DataSource } from 'typeorm';
// Models
import { MediaModel } from '../../Media/Data/MediaModel';
import { UserModel } from '../../Users/Data/UserModel';
import { CourseModel } from '../../Courses/Data/CourseModel';
import { CourseChapterModel } from '../../Courses/Data/Relations/CourseChapterModel';
import { CourseMaterialModel } from '../../Courses/Data/Relations/CourseMaterialModel';
import { WorkModel } from '../../Works/Data/WorkModel';
import { WorkTaskModel } from '../../Works/Data/Relations/WorkTaskModel';
import { AssignedWorkModel } from '../../AssignedWorks/Data/AssignedWorkModel';
import { AssignedWorkAnswerModel } from '../../AssignedWorks/Data/Relations/AssignedWorkAnswerModel';
import { AssignedWorkCommentModel } from '../../AssignedWorks/Data/Relations/AssignedWorkCommentModel';
import { CourseRequestModel } from '../../CRM/Data/CourseRequestModel';
import { CalenderEventModel } from '../../Calender/Data/CalenderEventModel';
import { BlogPostModel } from '../../Blog/Data/BlogPostModel';
import { BlogPostReactionModel } from '../../Blog/Data/Relations/BlogPostReactionModel';
import { PollModel } from '../../Polls/Data/PollModel';
import { PollQuestionModel } from '../../Polls/Data/Relations/PollQuestionModel';
import { PollAnswerModel } from '../../Polls/Data/Relations/PollAnswerModel';
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
        PollModel,
        PollQuestionModel,
        PollAnswerModel,
        BlogPostReactionModel,
        BlogPostModel,
    ],
    subscribers: [],
    migrations: [],
});
