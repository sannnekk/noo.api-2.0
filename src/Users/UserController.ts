import { Context } from '@modules/Core/Request/Context'
import * as Asserts from '@modules/Core/Security/asserts'
import { Controller, Delete, Get, Patch } from 'express-controller-decorator'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { UserValidator } from './UserValidator'
import { UserService } from './Services/UserService'

@Controller('/user')
export class UserController {
  private readonly userValidator: UserValidator

  private readonly userService: UserService

  constructor() {
    this.userValidator = new UserValidator()
    this.userService = new UserService()
  }

  @Get('/:username')
  async getByUsername(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const username = this.userValidator.parseSlug(context.params.username)

      const user = await this.userService.getByUsername(username)

      return new ApiResponse({ data: user })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:username/verify-manual')
  async verifyManual(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const username = this.userValidator.parseSlug(context.params.username)

      await this.userService.verifyManual(username)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/mentor/search')
  async getMentors(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)
      const pagination = this.userValidator.parsePagination(context.query)

      const { entities, meta } = await this.userService.getMentors(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/teacher/search')
  async getTeachers(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)
      const pagination = this.userValidator.parsePagination(context.query)

      const { entities, meta } = await this.userService.getTeachers(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/student/search')
  async getStudents(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)
      const pagination = this.userValidator.parsePagination(context.query)

      const { entities, meta } = await this.userService.getStudents(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/student/search/own')
  async getMyStudents(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.mentor(context)

      const pagination = this.userValidator.parsePagination(context.query)

      const { entities, meta } = await this.userService.getStudentsOf(
        context.credentials.userId,
        pagination
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Get('/')
  async getUsers(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)
      const pagination = this.userValidator.parsePagination(context.query)

      const { entities, meta } = await this.userService.getUsers(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id')
  async update(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const id = this.userValidator.parseId(context.params.id)
      const updateUserDTO = this.userValidator.parseUpdate(context.body)

      if (!['teacher', 'admin'].includes(context.credentials!.role)) {
        Asserts.isAuthorized(context, id)
      }

      await this.userService.update(id, updateUserDTO)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/password')
  async updatePassword(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const id = this.userValidator.parseId(context.params.id)
      const updatePasswordDTO = this.userValidator.parseUpdatePassword(
        context.body
      )

      if (!['teacher', 'admin'].includes(context.credentials!.role)) {
        Asserts.isAuthorized(context, id)
      }

      await this.userService.changePassword(id, updatePasswordDTO)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/role')
  async updateRole(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      await Asserts.teacherOrAdmin(context)

      const id = this.userValidator.parseId(context.params.id)
      const role = this.userValidator.parseRole(context.body)

      await this.userService.changeRole(id, role)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/telegram')
  async updateTelegram(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const id = this.userValidator.parseId(context.params.id)
      const updateTelegramDTO = this.userValidator.parseTelegramUpdate(
        context.body
      )

      if (!['teacher', 'admin'].includes(context.credentials!.role)) {
        Asserts.isAuthorized(context, id)
      }

      await this.userService.updateTelegram(id, updateTelegramDTO)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:id/email')
  async updateEmail(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const id = this.userValidator.parseId(context.params.id)
      const updateEmailDTO = this.userValidator.parseEmailUpdate(context.body)

      if (!['teacher', 'admin'].includes(context.credentials!.role)) {
        Asserts.isAuthorized(context, id)
      }

      await this.userService.sendEmailUpdate(id, updateEmailDTO.email)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Patch('/:studentId/:subjectId/mentor/:mentorId')
  async assignMentor(context: Context): Promise<ApiResponse> {
    try {
      Asserts.notStudent(context)
      const studentId = this.userValidator.parseId(context.params.studentId)
      const mentorId = this.userValidator.parseId(context.params.mentorId)
      const subjectId = this.userValidator.parseId(context.params.subjectId)

      await this.userService.assignMentor(studentId, mentorId, subjectId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }

  @Delete('/:id/:password')
  async delete(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const id = this.userValidator.parseId(context.params.id)
      const password = this.userValidator.parseNonemptyString(
        context.params.password
      )

      if (!['admin'].includes(context.credentials!.role)) {
        Asserts.isAuthorized(context, id)
      }

      await this.userService.delete(id, password)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error)
    }
  }
}
