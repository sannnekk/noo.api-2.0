import { VideoCommentRepository } from '../Data/VideoCommentRepository.js';
import { VideoAccessService } from './VideoAccessService.js';
import { NotFoundError } from '../../Core/Errors/NotFoundError.js';
import { UnauthorizedError } from '../../Core/Errors/UnauthorizedError.js';
import { VideoRepository } from '../Data/VideoRepository.js';
import { VideoOptions } from '../VideoOptions.js';
import { TooManyCommentsError } from '../Errors/TooManyCommentsError.js';
export class VideoCommentService {
    videoCommentRepository;
    videoAccessService;
    videoRepository;
    constructor() {
        this.videoCommentRepository = new VideoCommentRepository();
        this.videoAccessService = new VideoAccessService();
        this.videoRepository = new VideoRepository();
    }
    async getComments(videoId, userId, userRole, pagination) {
        const video = await this.videoRepository.findOne({ id: videoId });
        if (!video) {
            throw new NotFoundError('Видео не найдено');
        }
        if (!(await this.videoAccessService.canGetVideo(video, userId, userRole))) {
            throw new NotFoundError('Видео не найдено');
        }
        return this.videoCommentRepository.search({ video: { id: videoId } }, pagination, ['user']);
    }
    async addComment(videoId, userId, userRole, comment) {
        const video = await this.videoRepository.findOne({ id: videoId });
        if (!video ||
            !(await this.videoAccessService.canGetVideo(video, userId, userRole))) {
            throw new NotFoundError('Видео не найдено');
        }
        const existingComments = await this.videoCommentRepository.count({
            video: { id: videoId },
            user: { id: userId },
        });
        if (existingComments === VideoOptions.maxCommentsPerVideo) {
            throw new TooManyCommentsError();
        }
        return this.videoCommentRepository.create({
            ...comment,
            video: { id: videoId },
            user: { id: userId },
        });
    }
    async updateComment(userId, commentId, comment) {
        const oldComment = await this.videoCommentRepository.findOne({ id: commentId }, ['user']);
        if (!oldComment) {
            throw new NotFoundError('Комментарий не найден');
        }
        if (oldComment.user?.id !== userId) {
            throw new UnauthorizedError('Вы не можете редактировать этот комментарий');
        }
        return this.videoCommentRepository.update({
            ...oldComment,
            ...comment,
            id: commentId,
        });
    }
    async deleteComment(commentId, userId, userRole) {
        const comment = await this.videoCommentRepository.findOne({
            id: commentId,
        }, ['user']);
        if (!comment) {
            throw new NotFoundError('Комментарий не найден');
        }
        if (comment.user?.id !== userId &&
            userRole !== 'teacher' &&
            userRole !== 'admin') {
            throw new UnauthorizedError('Вы не можете удалить этот комментарий');
        }
        return this.videoCommentRepository.delete(commentId);
    }
}
