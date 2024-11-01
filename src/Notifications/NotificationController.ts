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
import { NotificationValidator } from './NotificationValidator'
import { NotificationService } from './Services/NotificationService'

@Controller('/notification')
export class NotificationsController {
  private readonly notificationService: NotificationService

  private readonly notificationValidator: NotificationValidator

  constructor() {
    this.notificationValidator = new NotificationValidator()
    this.notificationService = new NotificationService()
  }

  @Get('/read')
  public async getAll(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const pagination = this.notificationValidator.parsePagination(
        context.query
      )

      const { entities, meta } = await this.notificationService.getRead(
        context.credentials!.userId,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/unread')
  public async getUnread(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const count = await this.notificationService.getUnread(
        context.credentials!.userId
      )

      return new ApiResponse({ data: count })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/unread-count')
  public async getUnreadCount(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const count = await this.notificationService.getUnreadCount(
        context.credentials!.userId
      )

      return new ApiResponse({ data: count })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/mark-as-read')
  public async markAsRead(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const id = this.notificationValidator.parseId(context.params.id)
      const userId = context.credentials!.userId

      await this.notificationService.markAsRead(id, userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/mark-all-as-read')
  public async markAllAsRead(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      await this.notificationService.markAllAsRead(context.credentials!.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post()
  public async create(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const notificationCreationDTO =
        this.notificationValidator.parseNotificationCreation(context.body)

      await this.notificationService.create(
        notificationCreationDTO.notification,
        notificationCreationDTO.sendOptions
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async delete(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)

      const id = this.notificationValidator.parseId(context.params.id)
      const userId = context.credentials!.userId

      await this.notificationService.delete(id, userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
