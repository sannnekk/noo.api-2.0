import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { VideoService } from './Services/VideoService'
import { VideoValidator } from './VideoValidator'
import { VideoCommentService } from './Services/VideoCommentService'

@Controller('/video')
export class VideoController {
  private readonly videoService: VideoService

  private readonly videoCommentService: VideoCommentService

  private readonly videoValidator: VideoValidator

  public constructor() {
    this.videoService = new VideoService()
    this.videoCommentService = new VideoCommentService()
    this.videoValidator = new VideoValidator()
  }

  @Get()
  public async getVideos(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const pagination = this.videoValidator.parsePagination(context.query)

      const { entities, total, relations } = await this.videoService.getVideos(
        pagination,
        context.credentials!.userId,
        context.credentials!.role
      )

      return new ApiResponse({ data: entities, meta: { total, relations } })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/saved')
  public async getSavedVideos(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const pagination = this.videoValidator.parsePagination(context.query)

      const { entities, meta } = await this.videoService.getSavedVideos(
        context.credentials!.userId,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id')
  public async getVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      const video = await this.videoService.getVideo(
        videoId,
        context.credentials!.userId,
        context.credentials!.role
      )

      return new ApiResponse({ data: video })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id/access-info')
  public async getAccessInfo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      const accessInfo = await this.videoService.getVideoAccessInfo(videoId)

      return new ApiResponse({ data: accessInfo })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post()
  public async createVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const video = this.videoValidator.parseVideo(context.body)

      const { id, uploadUrl } = await this.videoService.createVideo(
        video,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse({ data: { uploadUrl, id } })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:id/finish-upload')
  public async finishUpload(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.finishUpload(
        videoId,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:id/publish')
  public async publishVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.publishVideo(
        videoId,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:id/reaction')
  public async toggleReaction(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)
      const { reaction } = this.videoValidator.parseVideoReaction(context.body)

      const newReactions = await this.videoService.toggleReaction(
        videoId,
        context.credentials!.userId,
        reaction
      )

      return new ApiResponse({ data: newReactions })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async updateVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const videoId = this.videoValidator.parseId(context.params.id)
      const video = this.videoValidator.parseVideoUpdate(context.body)

      await this.videoService.updateVideo(
        videoId,
        video,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse({ data: video })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/add-to-saved')
  public async addToSaved(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.addToSaved(videoId, context.credentials!.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/remove-from-saved')
  public async removeFromSaved(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.removeFromSaved(
        videoId,
        context.credentials!.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id/is-saved')
  public async isSaved(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      const isSaved = await this.videoService.isSaved(
        videoId,
        context.credentials!.userId
      )

      return new ApiResponse({ data: isSaved })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:videoId/comment')
  public async getComments(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.videoId)
      const pagination = this.videoValidator.parsePagination(context.query)

      const { entities: comments, meta } =
        await this.videoCommentService.getComments(
          videoId,
          context.credentials!.userId,
          context.credentials!.role,
          pagination
        )

      return new ApiResponse({ data: comments, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:videoId/comment')
  public async addComment(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.videoId)
      const comment = this.videoValidator.parseComment(context.body)

      await this.videoCommentService.addComment(
        videoId,
        context.credentials!.userId,
        context.credentials!.role,
        comment
      )

      return new ApiResponse({ data: comment })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/comment/:commentId')
  public async updateComment(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const commentId = this.videoValidator.parseId(context.params.commentId)
      const comment = this.videoValidator.parseComment(context.body)

      await this.videoCommentService.updateComment(
        context.credentials!.userId,
        commentId,
        comment
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/comment/:commentId')
  public async deleteComment(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const commentId = this.videoValidator.parseId(context.params.commentId)

      await this.videoCommentService.deleteComment(
        commentId,
        context.credentials!.userId,
        context.credentials!.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deleteVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.deleteVideo(
        videoId,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
