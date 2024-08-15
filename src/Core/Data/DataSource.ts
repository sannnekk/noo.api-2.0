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
import { BlogPostModel } from '@modules/Blog/Data/BlogPostModel'
import { BlogPostReactionModel } from '@modules/Blog/Data/Relations/BlogPostReactionModel'
import { PollModel } from '@modules/Polls/Data/PollModel'
import { PollQuestionModel } from '@modules/Polls/Data/Relations/PollQuestionModel'
import { PollAnswerModel } from '@modules/Polls/Data/Relations/PollAnswerModel'
import { SessionModel } from '@modules/Sessions/Data/SessionModel'
import { GoogleDocsBindingModel } from '@modules/GoogleDocs/Data/GoogleDocsBindingModel'
import { FAQArticleModel } from '@modules/FAQ/Data/FAQArticleModel'
import { UserAvatarModel } from '@modules/Users/Data/Relations/UserAvatarModel'
import { MentorAssignmentModel } from '@modules/Users/Data/Relations/MentorAssignmentModel'
import { SubjectModel } from '@modules/Subjects/Data/SubjectModel'

export const CoreDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  charset: 'utf8mb4',
  entities: [
    SubjectModel,
    FAQArticleModel,
    MediaModel,
    UserModel,
    UserAvatarModel,
    MentorAssignmentModel,
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
    SessionModel,
    GoogleDocsBindingModel,
  ],
  subscribers: [],
  migrations: [],
})
