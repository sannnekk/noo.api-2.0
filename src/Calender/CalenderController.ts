import { Controller, Delete, Get, Post } from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { CalenderService } from './Services/CalenderService'
import { CalenderValidator } from './CalenderValidator'

@Controller('/calender')
export class CalenderController {
  private readonly calenderService: CalenderService

  private readonly calenderValidator: CalenderValidator

  public constructor() {
    this.calenderService = new CalenderService()
    this.calenderValidator = new CalenderValidator()
  }

  @Post('/')
  public async createCalenderEvent(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const eventCreationOptions = this.calenderValidator.parseEventCreation(
        context.body
      )

      const calenderEvent = await this.calenderService.create(
        eventCreationOptions,
        context.credentials!.username
      )

      return new ApiResponse({ data: calenderEvent })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/')
  public async getCalenderEvents(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const pagination = this.calenderValidator.parsePagination(context.query)

      const { entities, meta } = await this.calenderService.get(
        context.credentials!.username,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deleteCalenderEvent(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const eventId = this.calenderValidator.parseId(context.params.id)

      await this.calenderService.delete(eventId, context.credentials!.username)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
