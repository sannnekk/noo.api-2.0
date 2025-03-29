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
import { SessionModel } from '../../Sessions/Data/SessionModel.js';
import { GoogleSheetsBindingModel } from '../../GoogleSheets/Data/GoogleSheetsBindingModel.js';
import { FAQArticleModel } from '../../FAQ/Data/FAQArticleModel.js';
import { UserAvatarModel } from '../../Users/Data/Relations/UserAvatarModel.js';
import { MentorAssignmentModel } from '../../Users/Data/Relations/MentorAssignmentModel.js';
import { SubjectModel } from '../../Subjects/Data/SubjectModel.js';
import { SnippetModel } from '../../Snippets/Data/SnippetModel.js';
import { config } from '../../config.js';
import { FAQCategoryModel } from '../../FAQ/Data/Relations/FAQCategoryModel.js';
import { NotificationModel } from '../../Notifications/Data/NotificationModel.js';
import { CourseAssignmentModel } from '../../Courses/Data/Relations/CourseAssignmentModel.js';
import { CourseMaterialReactionModel } from '../../Courses/Data/Relations/CourseMaterialReactionModel.js';
import { UserSettingsModel } from '../../UserSettings/Data/UserSettingsModel.js';
import { FavouriteTaskModel } from '../../AssignedWorks/Data/Relations/FavouriteTaskModel.js';
import { VideoModel } from '../../Video/Data/VideoModel.js';
import { VideoChapterModel } from '../../Video/Data/Relations/VideoChapterModel.js';
import { VideoCommentModel } from '../../Video/Data/Relations/VideoCommentModel.js';
import { TableModel } from '../../Tables/Data/TableModel.js';
import { TableCellModel } from '../../Tables/Data/Relations/TableCellModel.js';
import { VideoSavingModel } from '../../Video/Data/Relations/VideoSavingModel.js';
import { VideoReactionModel } from '../../Video/Data/Relations/VideoReactionModel.js';
export const CoreDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    charset: config.database.collations.withEmoji,
    debug: config.database.debug,
    entities: [
        SubjectModel,
        FAQArticleModel,
        FAQCategoryModel,
        MediaModel,
        UserModel,
        UserAvatarModel,
        UserSettingsModel,
        MentorAssignmentModel,
        CourseAssignmentModel,
        CourseModel,
        CourseChapterModel,
        CourseMaterialModel,
        CourseMaterialReactionModel,
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
        SessionModel,
        GoogleSheetsBindingModel,
        SnippetModel,
        NotificationModel,
        FavouriteTaskModel,
        VideoModel,
        VideoChapterModel,
        VideoCommentModel,
        VideoSavingModel,
        VideoReactionModel,
        TableModel,
        TableCellModel,
    ],
    subscribers: [],
    migrations: [],
});
