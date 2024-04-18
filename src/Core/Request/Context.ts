import { UserRepository } from '@modules/Users/Data/UserRepository'
import { JWTPayload, parseHeader } from '../Security/jwt'
import express from 'express'
import { RoleChangedButNotReloggedInError } from '../Errors/RoleChangedButNotReloggedInError'

export class Context {
	public params: Record<string, string | number | undefined>
	public readonly body: unknown
	public readonly credentials?: JWTPayload
	public readonly query: Record<string, string | number | undefined>
	private readonly userRepository: UserRepository

	public constructor(req: express.Request) {
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

	public setParams(
		params: Record<string, string | number | undefined>
	): void {
		this.params = params
	}
}
