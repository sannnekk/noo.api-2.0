import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
} from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { CourseValidator } from './CourseValidator'
import { CourseService } from './Services/CourseService'

@Controller('/course')
export class CourseController {
  private readonly courseService: CourseService

  private readonly courseValidator: CourseValidator

  constructor() {
    this.courseService = new CourseService()
    this.courseValidator = new CourseValidator()
  }

  @Get('/')
  public async get(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.notStudent(context)
      const pagination = this.courseValidator.parsePagination(context.query)

      const { entities, meta } = await this.courseService.get(pagination)

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/own')
  public async getMyCourses(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)

      const pagination = this.courseValidator.parsePagination(context.query)

      const { entities, meta } = await this.courseService.getOwn(
        pagination,
        context.credentials!.userId
      )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/student/:studentId?')
  public async getStudentCourses(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const studentId =
        this.courseValidator.parseOptionalId(context.params.studentId) ||
        context.credentials!.userId
      const pagination = this.courseValidator.parsePagination(context.query)

      if (context.credentials!.role === 'student') {
        Asserts.isAuthorized(context, studentId)
      }

      const { entities: courseAssignments, meta } =
        await this.courseService.getStudentCourseAssignments(
          studentId,
          pagination
        )

      return new ApiResponse({ data: courseAssignments, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:assignmentId/archive')
  public async archive(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const assignmentId = this.courseValidator.parseId(
        context.params.assignmentId
      )

      await this.courseService.archive(assignmentId, context.credentials.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:assignmentId/unarchive')
  public async unarchive(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const assignmentId = this.courseValidator.parseId(
        context.params.assignmentId
      )

      await this.courseService.unarchive(
        assignmentId,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:assignmentId/pin')
  public async pin(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const assignmentId = this.courseValidator.parseId(
        context.params.assignmentId
      )

      await this.courseService.pin(assignmentId, context.credentials.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:assignmentId/unpin')
  public async unpin(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const assignmentId = this.courseValidator.parseId(
        context.params.assignmentId
      )

      await this.courseService.unpin(assignmentId, context.credentials.userId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/material/:materialId/react/:reaction')
  public async react(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.student(context)
      const materialId = this.courseValidator.parseId(context.params.materialId)
      const reaction = this.courseValidator.parseReaction(
        context.params.reaction
      )

      await this.courseService.toggleReaction(
        materialId,
        context.credentials.userId,
        reaction
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:slug')
  public async getBySlug(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const courseSlug = this.courseValidator.parseSlug(context.params.slug)

      const course = await this.courseService.getBySlug(
        courseSlug,
        context.credentials!.userId,
        context.credentials!.role
      )

      return new ApiResponse({ data: course })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/material/:slug/assigned-work')
  public async getAssignedWork(context: Context): Promise<ApiResponse> {
    try {
      const materialSlug = this.courseValidator.parseSlug(context.params.slug)
      await Asserts.isAuthenticated(context)
      Asserts.student(context)

      const assignedWork = await this.courseService.getAssignedWorkToMaterial(
        materialSlug,
        context.credentials.userId
      )

      return new ApiResponse({ data: assignedWork })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/')
  public async create(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const courseCreationOptions = this.courseValidator.parseCreation(
        context.body
      )

      await this.courseService.create(
        courseCreationOptions,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/:courseSlug/chapter')
  public async createChapter(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const courseSlug = this.courseValidator.parseSlug(
        context.params.courseSlug
      )
      const chapter = this.courseValidator.parseChapterCreation(context.body)

      await this.courseService.createChapter(courseSlug, chapter)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async update(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const courseId = this.courseValidator.parseId(context.params.id)
      const updateCourseOptions = this.courseValidator.parseUpdate(context.body)

      await this.courseService.update(courseId, updateCourseOptions)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:materialSlug/assign-work/:workId')
  public async assignWorkToMaterial(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const materialSlug = this.courseValidator.parseSlug(
        context.params.materialSlug
      )
      const workId = this.courseValidator.parseId(context.params.workId)
      const assignWorkOptions = this.courseValidator.parseAssignWorkOptions(
        context.body
      )

      await this.courseService.assignWorkToMaterial(
        materialSlug,
        workId,
        assignWorkOptions.solveDeadline,
        assignWorkOptions.checkDeadline
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:materialSlug/unassign-work')
  public async unassignWorkFromMaterial(
    context: Context
  ): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const materialSlug = this.courseValidator.parseSlug(
        context.params.materialSlug
      )

      await this.courseService.unassignWorkFromMaterial(materialSlug)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:courseId/student-list')
  public async getStudentList(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)

      const courseId = this.courseValidator.parseId(context.params.courseId)
      const pagination = this.courseValidator.parsePagination(context.query)

      const { entities, meta } =
        await this.courseService.getStudentListWithAssignments(
          courseId,
          pagination
        )

      return new ApiResponse({ data: entities, meta })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:courseSlug/add-students')
  public async addStudents(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const courseSlug = this.courseValidator.parseSlug(
        context.params.courseSlug
      )
      const { studentIds } = this.courseValidator.parseStudentIds(context.body)

      await this.courseService.addStudents(
        courseSlug,
        studentIds,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:courseSlug/remove-students')
  public async removeStudents(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const courseSlug = this.courseValidator.parseSlug(
        context.params.courseSlug
      )
      const { studentIds } = this.courseValidator.parseStudentIds(context.body)

      await this.courseService.removeStudents(courseSlug, studentIds)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:courseSlug/add-students-via-emails')
  public async addStudentsViaEmails(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      const courseSlug = this.courseValidator.parseSlug(
        context.params.courseSlug
      )
      const { emails } = this.courseValidator.parseEmails(context.body)

      await this.courseService.addStudentsViaEmails(
        courseSlug,
        emails,
        context.credentials.userId
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:courseSlug/remove-students-via-emails')
  public async removeStudentsViaEmails(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      const courseSlug = this.courseValidator.parseSlug(
        context.params.courseSlug
      )
      const { emails } = this.courseValidator.parseEmails(context.body)

      await this.courseService.removeStudentsViaEmails(courseSlug, emails)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async delete(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacher(context)
      const courseId = this.courseValidator.parseId(context.params.id)

      await this.courseService.delete(courseId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
