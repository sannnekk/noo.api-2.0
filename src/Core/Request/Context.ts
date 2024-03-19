import { JWTPayload, parseHeader } from '../Security/jwt'
import { PermissionResolver } from '../Security/permissions'
import express from 'express'

export class Context {
	public params: Record<string, string | number | undefined>
	public readonly body: unknown
	public readonly credentials?: JWTPayload
	public readonly permissionResolver?: PermissionResolver
	public readonly query: Record<string, string | number | undefined>
	public readonly files?: any[]

	public constructor(req: express.Request) {
		this.body = this.parseBody(req.body)
		this.params = req.params as typeof this.params
		this.query = req.query as typeof this.query

		if (req.method === 'POST' && req.path === '/media') {
			this.files = (req.files as typeof this.files) || []
		}

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

	public setParams(
		params: Record<string, string | number | undefined>
	): void {
		this.params = params
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
