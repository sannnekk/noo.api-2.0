import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { injectControllers, setContextClass, } from 'express-controller-decorator';
import { Context, CoreDataSource } from './core/index.js';
// import modules
import './Users/UserController.js';
import './Courses/CourseController.js';
import './Works/WorkController.js';
import './AssignedWorks/AssignedWorkController.js';
import './Media/MediaController.js';
await CoreDataSource.initialize();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
setContextClass(Context);
injectControllers(app);
app.listen(process.env.APP_PORT, () => console.log(`Server is running on port ${process.env.APP_PORT}`));
export default app;
