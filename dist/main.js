import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { injectControllers, setContextClass, } from 'express-controller-decorator';
import { Context, CoreDataSource } from './core/index';
// import modules
import './Users/UserController';
import './Courses/CourseController';
import './Works/WorkController';
import './AssignedWorks/AssignedWorkController';
await CoreDataSource.initialize();
const app = express();
app.use(cors());
app.use(express.json());
setContextClass(Context);
injectControllers(app);
app.listen(process.env.APP_PORT, () => console.log(`Server is running on port ${process.env.APP_PORT}`));
export default app;
