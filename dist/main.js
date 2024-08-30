import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { CoreDataSource } from './Core/Data/DataSource.js';
import { injectControllers, setContextClass, } from 'express-controller-decorator';
import { Context } from './Core/Request/Context.js';
import { config } from './config.js';
// import modules
import './Auth/AuthController.js';
import './Users/UserController.js';
import './Courses/CourseController.js';
import './Works/WorkController.js';
import './AssignedWorks/AssignedWorkController.js';
import './Media/MediaController.js';
import './Calender/CalenderController.js';
import './Statistics/StatisticsController.js';
import './Blog/BlogController.js';
import './Polls/PollController.js';
import './CRM/CRMController.js';
import './Sessions/SessionsController.js';
import './GoogleSheets/GoogleSheetsController.js';
import './Platform/PlatformController.js';
import './Subjects/SubjectController.js';
import './Snippets/SnippetsController.js';
import './FAQ/FAQController.js';
import './Notifications/NotificationController.js';
await CoreDataSource.initialize();
const app = express();
app.set('trust proxy', true);
app.use(cors());
app.use(express.json(config.expressJson));
app.use(express.urlencoded(config.expressUrlencoded));
setContextClass(Context);
injectControllers(app);
app.listen(process.env.APP_PORT, () => 
// eslint-disable-next-line no-console
console.log(`Server is running on port ${process.env.APP_PORT}`));
// for test purposes
export default app;
