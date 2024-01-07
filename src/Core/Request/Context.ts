import { JWTPayload, parseHeader } from '../Security/jwt'
import { PermissionResolver } from '../Security/permissions'
import express from 'express'

export class Context {
	public readonly body: unknown
	public readonly params: Record<string, string | number | undefined>
	public readonly credentials?: JWTPayload
	public readonly permissionResolver?: PermissionResolver

	public constructor(req: express.Request) {
		this.body = req.body
		this.params = req.params as typeof this.params

		const authHeader = req.headers.authorization

		if (!authHeader) {
			return
		}

		this.credentials = parseHeader(authHeader)

		if (!this.credentials) {
			return
		}

		this.permissionResolver = new PermissionResolver(
			this.credentials.permissions
		)
	}

	public isAuthenticated(): boolean {
		return !!this.credentials
	}
}
