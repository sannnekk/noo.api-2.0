import { JWTPayload, parseHeader } from '../Security/jwt'
import { PermissionResolver } from '../Security/permissions'
import express from 'express'

export class Context {
	public readonly body: unknown
	public readonly params: Record<string, string | number | undefined>
	public readonly credentials?: JWTPayload
	public readonly permissionResolver?: PermissionResolver
	public readonly query: Record<string, string | number | undefined>

	public constructor(req: express.Request) {
		this.body = this.parseBody(req.body)
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

		this.permissionResolver = new PermissionResolver(
			this.credentials.permissions
		)
	}

	public isAuthenticated(): boolean {
		return !!this.credentials
	}

	private parseBody(body: object): object {
		return JSON.parse(JSON.stringify(body), (_, value) => {
			if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
				return new Date(value)
			}

			return value
		})
	}
}
