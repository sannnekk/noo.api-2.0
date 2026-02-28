import { Context } from '@modules/Core/Request/Context'
import { Controller, Get, Patch, Post } from 'express-controller-decorator'
import { ApiResponse } from '@modules/Core/Response/ApiResponse'
import { AuthValidator } from './AuthValidator'
import { AuthService } from './Services/AuthService'
import { UserService } from '@modules/Users/Services/UserService'

@Controller('/auth')
export class AuthController {
  private readonly userValidator: AuthValidator

  private readonly authService: AuthService

  private readonly userService: UserService

  constructor() {
    this.userValidator = new AuthValidator()
    this.authService = new AuthService()
    this.userService = new UserService()
  }

  @Post('/login')
  async login(context: Context): Promise<ApiResponse> {
    try {
      const loginDTO = this.userValidator.parseLogin(context.body)

      const payload = await this.authService.login(loginDTO, context)

      return new ApiResponse({ data: payload })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/register')
  async register(context: Context): Promise<ApiResponse> {
    try {
      const registerDTO = this.userValidator.parseRegister(context.body)
      await this.authService.register(registerDTO)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Get('/check-username/:username')
  async checkUsername(context: Context): Promise<ApiResponse> {
    try {
      const username = this.userValidator.parseSlug(context.params.username)

      const exists = await this.authService.checkUsername(username)

      return new ApiResponse({ data: { exists } })
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/resend-verification')
  async resendVerification(context: Context): Promise<ApiResponse> {
    try {
      const resendVerificationDTO = this.userValidator.parseResendVerification(
        context.body
      )
      await this.authService.resendVerification(resendVerificationDTO.email)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/verify')
  async verify(context: Context): Promise<ApiResponse> {
    try {
      const verificationDTO = this.userValidator.parseVerification(context.body)

      await this.authService.verify(
        verificationDTO.username,
        verificationDTO.token
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Patch('/verify-email-change')
  async verifyEmailChange(context: Context): Promise<ApiResponse> {
    try {
      const emailChangeVerificationDTO =
        this.userValidator.parseEmailChangeVerification(context.body)

      await this.userService.confirmEmailUpdate(
        emailChangeVerificationDTO.username,
        emailChangeVerificationDTO.token
      )

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }

  @Post('/forgot-password')
  async forgotPassword(context: Context): Promise<ApiResponse> {
    try {
      const forgotPasswordDTO = this.userValidator.validateForgotPassword(
        context.body
      )

      await this.authService.forgotPassword(forgotPasswordDTO.email)

      return new ApiResponse()
    } catch (error: any) {
      return new ApiResponse(error, context)
    }
  }
}
