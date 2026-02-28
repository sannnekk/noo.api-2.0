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
import { TableValidator } from './TableValidator'
import { TableService } from './Services/TableService'

@Controller('/table')
export class TableController {
  private readonly tableService: TableService

  private readonly tableValidator: TableValidator

  constructor() {
    this.tableService = new TableService()
    this.tableValidator = new TableValidator()
  }

  @Get()
  public async getTables(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const pagination = this.tableValidator.parsePagination(context.query)

      const { entities: tables, meta } = await this.tableService.getTables(
        context.credentials.userId,
        pagination
      )

      return new ApiResponse({ data: tables, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id')
  public async getTableById(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const tableId = this.tableValidator.parseId(context.params.id)

      const table = await this.tableService.getTable(
        tableId,
        context.credentials.userId
      )

      return new ApiResponse({ data: table })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post()
  public async createTable(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const tableData = this.tableValidator.parseTable(context.body)

      const table = await this.tableService.createTable(
        tableData,
        context.credentials.userId
      )

      return new ApiResponse({ data: table })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async updateTable(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const tableId = this.tableValidator.parseId(context.params.id)
      const tableData = this.tableValidator.parseTable(context.body)

      await this.tableService.updateTable(
        tableId,
        tableData,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deleteTable(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const tableId = this.tableValidator.parseId(context.params.id)

      await this.tableService.deleteTable(tableId, context.credentials.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
