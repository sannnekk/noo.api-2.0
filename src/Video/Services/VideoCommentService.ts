import { User } from '@modules/Users/Data/User'
import { VideoCommentRepository } from '../Data/VideoCommentRepository'
import { Pagination } from '@modules/Core/Data/Pagination'
import { VideoComment } from '../Data/Relations/VideoComment'
import { VideoAccessService } from './VideoAccessService'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'
import { VideoRepository } from '../Data/VideoRepository'
import { Video } from '../Data/Video'
import { VideoOptions } from '../VideoOptions'
import { TooManyCommentsError } from '../Errors/TooManyCommentsError'

export class VideoCommentService {
  private readonly videoCommentRepository: VideoCommentRepository

  private readonly videoAccessService: VideoAccessService

  private readonly videoRepository: VideoRepository

  public constructor() {
    this.videoCommentRepository = new VideoCommentRepository()
    this.videoAccessService = new VideoAccessService()
    this.videoRepository = new VideoRepository()
  }

  public async getComments(
    videoId: string,
    userId: User['id'],
    userRole: User['role'],
    pagination: Pagination
  ) {
    const video = await this.videoRepository.findOne({ id: videoId })

    if (!video) {
      throw new NotFoundError('Видео не найдено')
    }

    if (!(await this.videoAccessService.canGetVideo(video, userId, userRole))) {
      throw new NotFoundError('Видео не найдено')
    }

    return this.videoCommentRepository.search(
      { video: { id: videoId } },
      pagination,
      ['user']
    )
  }

  public async addComment(
    videoId: string,
    userId: User['id'],
    userRole: User['role'],
    comment: VideoComment
  ) {
    const video = await this.videoRepository.findOne({ id: videoId })

    if (
      !video ||
      !(await this.videoAccessService.canGetVideo(video, userId, userRole))
    ) {
      throw new NotFoundError('Видео не найдено')
    }

    const existingComments = await this.videoCommentRepository.count({
      video: { id: videoId },
      user: { id: userId },
    })

    if (existingComments === VideoOptions.maxCommentsPerVideo) {
      throw new TooManyCommentsError()
    }

    return this.videoCommentRepository.create({
      ...comment,
      video: { id: videoId } as Video,
      user: { id: userId } as User,
    })
  }

  public async updateComment(
    userId: User['id'],
    commentId: string,
    comment: VideoComment
  ) {
    const oldComment = await this.videoCommentRepository.findOne(
      { id: commentId },
      ['user']
    )

    if (!oldComment) {
      throw new NotFoundError('Комментарий не найден')
    }

    if (oldComment.user?.id !== userId) {
      throw new UnauthorizedError('Вы не можете редактировать этот комментарий')
    }

    return this.videoCommentRepository.update({
      ...oldComment,
      ...comment,
      id: commentId,
    })
  }

  public async deleteComment(
    commentId: string,
    userId: User['id'],
    userRole: User['role']
  ) {
    const comment = await this.videoCommentRepository.findOne(
      {
        id: commentId,
      },
      ['user']
    )

    if (!comment) {
      throw new NotFoundError('Комментарий не найден')
    }

    if (
      comment.user?.id !== userId &&
      userRole !== 'teacher' &&
      userRole !== 'admin'
    ) {
      throw new UnauthorizedError('Вы не можете удалить этот комментарий')
    }

    return this.videoCommentRepository.delete(commentId)
  }
}
