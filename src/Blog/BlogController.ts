import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
} from 'express-controller-decorator'
import * as Asserts from '@modules/Core/Security/asserts'
import { Context } from '@modules/Core/Request/Context'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { BlogService } from './Services/BlogService'
import { BlogValidator } from './BlogValidator'

@Controller('/blog')
export class BlogController {
  private readonly blogService: BlogService

  private readonly blogValidator: BlogValidator

  constructor() {
    this.blogService = new BlogService()
    this.blogValidator = new BlogValidator()
  }

  @Get('/')
  public async getPosts(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const pagination = this.blogValidator.parsePagination(context.query)

      const { entities, meta } = await this.blogService.getAll(
        pagination,
        context.credentials!.userId
      )

      return new ApiResponse({
        data: entities,
        meta,
      })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/:id')
  public async getPost(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const blogId = this.blogValidator.parseId(context.params.id)

      const post = await this.blogService.getById(
        blogId,
        context.credentials!.userId
      )

      return new ApiResponse({ data: post })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id/react/:reaction')
  public async reactToPost(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      const postId = this.blogValidator.parseId(context.params.id)
      const reaction = this.blogValidator.parseReaction(context.params.reaction)

      const newCounts = await this.blogService.toggleReaction(
        postId,
        context.credentials!.userId,
        reaction
      )

      return new ApiResponse({ data: newCounts })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/')
  public async createPost(context: Context): Promise<ApiResponse> {
    try {
      await Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      const post = this.blogValidator.parseCreateBlog(context.body)

      const createdPost = await this.blogService.create(
        post,
        context.credentials.userId
      )

      return new ApiResponse({ data: createdPost })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/:id')
  public async updatePost(context: Context): Promise<ApiResponse> {
    try {
      Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      this.blogValidator.parseId(context.params.id)
      const post = this.blogValidator.parseUpdateBlog(context.body)

      await this.blogService.update(post)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Delete('/:id')
  public async deletePost(context: Context): Promise<ApiResponse> {
    try {
      Asserts.isAuthenticated(context)
      Asserts.teacherOrAdmin(context)
      const postId = this.blogValidator.parseId(context.params.id)

      await this.blogService.delete(postId)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
