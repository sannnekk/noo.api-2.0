import { UserRepository } from '@modules/Users/Data/UserRepository'
import { JWTPayload, parseHeader } from '../Security/jwt'
import express from 'express'
import multer from 'multer'
import { RoleChangedButNotReloggedInError } from '../Errors/RoleChangedButNotReloggedInError'
import { MediaHandler } from './MediaHandler'

export class Context {
	public readonly params: Record<string, string | number | undefined>
	public readonly body: unknown
	public readonly credentials?: JWTPayload
	public readonly query: Record<string, string | number | undefined>

	public readonly _req: Express.Request

	private readonly userRepository: UserRepository

	public constructor(req: express.Request) {
		this._req = req
		this.userRepository = new UserRepository()
		this.body = req.body
		this.params = req.params as typeof this.params
		this.query = req.query as typeof this.query

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
			return
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
}
