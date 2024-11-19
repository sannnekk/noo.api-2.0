import { Pagination } from '../../Core/Data/Pagination.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { WorkTaskRepository } from '../../Works/Data/WorkTaskRepository.js';
import { FavouriteTaskRepository } from '../Data/FavouriteTaskRepository.js';
import { AlreadyExistError } from '../../Core/Errors/AlreadyExistError.js';
import { AssignedWorkCommentRepository } from '../Data/AssignedWorkCommentRepository.js';
export class FavouriteTaskService {
    favouriteTaskRepository;
    taskRepository;
    commentRepository;
    constructor() {
        this.favouriteTaskRepository = new FavouriteTaskRepository();
        this.taskRepository = new WorkTaskRepository();
        this.commentRepository = new AssignedWorkCommentRepository();
    }
    async getFavouriteTasks(userId, subjectId, count) {
        return this.favouriteTaskRepository.search({
            user: {
                id: userId,
            },
            task: {
                work: {
                    subject: {
                        id: subjectId,
                    },
                },
            },
        }, new Pagination(1, count), ['task', 'task.work']);
    }
    async isTaskFavourite(userId, taskId) {
        const favourite = await this.favouriteTaskRepository.findOne({
            user: {
                id: userId,
            },
            task: {
                id: taskId,
            },
        });
        return !!favourite;
    }
    async addTaskToFavourites(userId, taskId) {
        const task = await this.taskRepository.findOne({
            id: taskId,
        });
        if (!task) {
            throw new NotFoundError('Задание не найдено');
        }
        const favouriteTask = await this.favouriteTaskRepository.findOne({
            user: {
                id: userId,
            },
            task: {
                id: taskId,
            },
        });
        if (favouriteTask) {
            throw new AlreadyExistError('Задание уже добавлено в избранное');
        }
        const existingComment = await this.commentRepository.findOne({
            task: {
                id: taskId,
            },
            assignedWork: {
                student: {
                    id: userId,
                },
            },
        });
        return this.favouriteTaskRepository.create({
            user: {
                id: userId,
            },
            task: {
                id: taskId,
            },
            answer: null,
            comment: existingComment,
        });
    }
    async removeFavouriteTask(userId, taskId) {
        return this.favouriteTaskRepository.deleteFavourite(userId, taskId);
    }
    async bulkRemoveFavouriteTasks(userId, taskIds) {
        return this.favouriteTaskRepository.bulkDeleteFavourites(userId, taskIds);
    }
}
