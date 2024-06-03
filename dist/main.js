import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { CoreDataSource } from './Core/Data/DataSource';
import { injectControllers, setContextClass, } from 'express-controller-decorator';
import { Context } from './Core/Request/Context';
// import modules
import './Users/UserController';
import './Courses/CourseController';
import './Works/WorkController';
import './AssignedWorks/AssignedWorkController';
import './Media/MediaController';
import './Calender/CalenderController';
import './Statistics/StatisticsController';
import './Blog/BlogController';
import './Polls/PollController';
import { config } from './config';
await CoreDataSource.initialize();
const app = express();
app.use(cors());
app.use(express.json(config.expressJson));
app.use(express.urlencoded(config.expressUrlencoded));
setContextClass(Context);
injectControllers(app);
app.listen(process.env.APP_PORT, () => console.log(`Server is running on port ${process.env.APP_PORT}`));
// for test purposes
export default app;
