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

@Controller('/video')
export class VideoController {
  private readonly videoService: VideoService

  private readonly videoValidator: VideoValidator

  public constructor() {
    this.videoService = new VideoService()
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

  @Get('/:id')
  public async getVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      const video = await this.videoService.getVideo(videoId)

      return new ApiResponse({ data: video })
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

      const uploadUrl = this.videoService.createVideo(
        video,
        context.credentials.userId,
        context.credentials.role
      )

      return new ApiResponse({ data: { uploadUrl } })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:id/finish-upload')
  public async finishUpload(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.finishUpload(videoId)

      return new ApiResponse()
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
      const video = this.videoValidator.parseVideo(context.body)

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

  @Delete('/:id')
  public async deleteVideo(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)

      const videoId = this.videoValidator.parseId(context.params.id)

      await this.videoService.deleteVideo(videoId, context.credentials.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
