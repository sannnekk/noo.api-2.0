import { JWTPayload, parseHeader } from '../Security/jwt'
import express from 'express'

export class Context {
	public params: Record<string, string | number | undefined>
	public readonly body: unknown
	public readonly credentials?: JWTPayload
	public readonly query: Record<string, string | number | undefined>

	public constructor(req: express.Request) {
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

	public isAuthenticated(): boolean {
		return !!this.credentials
	}

	public setParams(
		params: Record<string, string | number | undefined>
	): void {
		this.params = params
	}
}
