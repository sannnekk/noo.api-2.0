import { User } from '@modules/Users/Data/User'
import { VideoCommentRepository } from '../Data/VideoCommentRepository'
import { Pagination } from '@modules/Core/Data/Pagination'
import { VideoComment } from '../Data/Relations/VideoComment'
import { VideoAccessService } from './VideoAccessService'
import { NotFoundError } from '@modules/Core/Errors/NotFoundError'
import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'

export class VideoCommentService {
  private readonly videoCommentRepository: VideoCommentRepository

  private readonly videoAccessService: VideoAccessService

  public constructor() {
    this.videoCommentRepository = new VideoCommentRepository()
    this.videoAccessService = new VideoAccessService()
  }

  public async getComments(
    videoId: string,
    userId: User['id'],
    pagination: Pagination
  ) {
    throw new Error('Not implemented')
  }

  public async addComment(
    videoId: string,
    userId: User['id'],
    comment: VideoComment
  ) {
    throw new Error('Not implemented')
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
}
