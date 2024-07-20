import express from 'express'
import { UserRepository } from '@modules/Users/Data/UserRepository'
import { JWTPayload, parseHeader } from '../Security/jwt'
import { RoleChangedButNotReloggedInError } from '../Errors/RoleChangedButNotReloggedInError'
import { MediaHandler } from './MediaHandler'
import type { RequestInfo } from './RequestInfo'
import { parseUserAgent } from '../Utils/userAgent'
import { SessionService } from '@modules/Sessions/Services/SessionService'

export class Context {
  public readonly params: Record<string, string | number | undefined>

  public readonly body: unknown

  public credentials?: JWTPayload

  public readonly query: Record<string, string | number | undefined>

  public readonly _req: Express.Request

  public readonly info: RequestInfo

  private readonly userRepository: UserRepository

  private readonly sessionService: SessionService

  public constructor(req: express.Request) {
    this._req = req
    this.userRepository = new UserRepository()
    this.sessionService = new SessionService()
    this.body = req.body
    this.params = req.params as typeof this.params
    this.query = req.query as typeof this.query

    this.info = this.getRequestInfo(req)

    const authHeader = req.headers.authorization

    if (!authHeader) {
      return
    }

    this.credentials = parseHeader(authHeader)

    if (!this.credentials) {
      return
    }

    if (this.credentials.isBlocked) {
      this.credentials = undefined
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const username = this.credentials?.username
    const claimedRole = this.credentials?.role

    if (!username) {
      return false
    }

    const user = await this.userRepository.findOne({ username })

    if (!user) {
      return false
    }

    if (user.isBlocked) {
      return false
    }

    if (claimedRole !== user.role) {
      throw new RoleChangedButNotReloggedInError()
    }

    const session = await this.sessionService.getCurrentSession(this)

    if (!session) {
      return false
    }

    await this.sessionService.updateSession(session, this)

    return true
  }

  public async getFiles(): Promise<Express.Multer.File[]> {
    return new Promise((resolve, reject) => {
      const req = this._req
      MediaHandler(<any>req, <any>undefined, (error: any) => {
        if (req.files && Array.isArray(req.files)) {
          resolve(req.files)
        } else {
          reject(error)
        }
      })
    })
  }

  private getRequestInfo(req: express.Request): RequestInfo {
    const userAgent = req.header('User-Agent') || ''
    const isMobile = /Mobi/.test(userAgent)
    const ipAddress = req.ip || ''
    const browser = parseUserAgent(req.header('User-Agent') || '').browser || ''
    const os = parseUserAgent(req.header('User-Agent') || '').os || ''
    const device = parseUserAgent(req.header('User-Agent') || '').device || ''

    return {
      userAgent,
      isMobile,
      ipAddress,
      browser,
      os,
      device,
    }
  }
}
