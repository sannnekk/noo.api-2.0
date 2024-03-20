import express from 'express';
import cors from 'cors';
import 'reflect-metadata';
import { CoreDataSource } from './Core/Data/DataSource.js';
import { ContextMiddleware } from './Core/Request/ContextMiddleware.js';
// import modules
import { UserController } from './Users/UserController.js';
import { CourseController } from './Courses/CourseController.js';
import { WorkController } from './Works/WorkController.js';
import { AssignedWorkController } from './AssignedWorks/AssignedWorkController.js';
import { MediaController } from './Media/MediaController.js';
import { CalenderController } from './Calender/CalenderController.js';
import { attachControllers } from '@decorators/express';
await CoreDataSource.initialize();
const app = express();
app.use(cors());
app.use(express.json({
    limit: '50mb',
    reviver: (_, value) => {
        if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return new Date(value);
        }
        return value;
    },
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(ContextMiddleware);
attachControllers(app, [
    UserController,
    CourseController,
    WorkController,
    AssignedWorkController,
    MediaController,
    CalenderController,
]);
app.listen(process.env.APP_PORT, () => console.log(`Server is running on port ${process.env.APP_PORT}`));
